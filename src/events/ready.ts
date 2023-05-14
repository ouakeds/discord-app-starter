import { BotEvent } from "../types";
import { Client, EmbedBuilder, Events, TextChannel } from "discord.js";
import puppeteer, { ElementHandle, Page } from 'puppeteer';

export interface Product {
  author?: string;
  href?: string;
  price?: string;
  imageSrc?: string | null;
  name?: string | null;
  brand?: string | null;
  size?: string | null;
  published?: string | null;
}

const formatProduct = async (element: ElementHandle<Element>, page: Page, channel: TextChannel): Promise<Product | void> => {

  const authorElement = await element.$('.web_ui__ItemBox__name h4');
  const hrefElement = await element.$('.web_ui__ItemBox__overlay');
  const priceElement = await element.$('.web_ui__ItemBox__title-content h3');

  const author = await (authorElement ? page.evaluate((el) => el.textContent, authorElement) : '');
  const href = await (hrefElement ? page.evaluate((el) => el.getAttribute('href'), hrefElement) : '');
  const price = await (priceElement ? page.evaluate((el) => el.textContent, priceElement) : '');

  if (!author || !href || !price)
    return;

  const messages = await channel.messages.fetch();
  const searchedMessage = messages.find((message) => message.embeds[0]?.url === href);

  if (searchedMessage)
    return;

    
  const productPage = await page.browser().newPage();
  await productPage.goto(href);
  
  try {
    await productPage.waitForSelector('.item-thumbnail img');
  } catch (error) {
    return;
  }
  
  const imageElement = await productPage.$('.item-thumbnail img');
  const imageSrc = await (imageElement ? productPage.evaluate((el) => el.getAttribute('src'), imageElement) : '');

  const brand = await productPage.$eval('.details-list__item-value[itemprop="brand"] [itemprop="name"]', (element) => element.textContent);
  let size = await productPage.$eval('.details-list__item-value[itemprop="size"]', (element) => element.textContent);
  const published = await productPage.$eval('.details-list__item[data-testid="item-details-uploaded_date"] .details-list__item-value span', (element) => element.textContent);
  const name = await productPage.$eval('[itemprop="name"] h2.web_ui__Text__text.web_ui__Text__title.web_ui__Text__left', (element) => element?.textContent?.trim());

  await productPage.close();

  if (size) {
    size = size.replace('Size information', '').trim();
  }

  return { author, href, price, imageSrc, name, brand, size, published};
};

const scrapeVinted = async (client: Client, channel: TextChannel, url: string) => {

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForSelector('.feed-grid__item-content');

  const productElements = await page.$$('.feed-grid__item-content');
  const products: Product[] = [];

  for (const element of productElements) {
    const product: Product | void = await formatProduct(element, page, channel);

    if (product && product.author && product.href && product.price && product.name) {
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(product.name.toUpperCase())
            .addFields([
              {
                name: '👤\tVendeur',
                value: product.author
              },
              {
                name: '💸\tPrix',
                value: product.price
              },
              {
                name: '👕\tMarque',
                value: product?.brand ?? ''
              },
              {
                name: '📏\tTaille',
                value: product?.size ?? ''
              },
              {
                name: '📅\tPublication',
                value: product?.published ?? ''
              },
              
            ])
            .setColor('#0099ff')
            .setImage(product?.imageSrc ?? '')
            .setURL(product.href)
        ],
      })
    }
  }

  await page.close();
  await browser.close();

  return products;
}


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const recursiveChecker = async (client: Client, title: string, channelId: string, url: string): Promise<void> => {

  const channel = await client.channels.cache.get(channelId) as TextChannel;

  try {
    await scrapeVinted(client, channel, url)
  } catch (error) {
    console.log(error)
  }
  await sleep(1200000)

  return recursiveChecker(client, title, channelId, url);
}

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute: async (client: Client) => {

      const brands = [
        {
          title: 'Global',
          channelId: "1106596856642945224",
          url: 'https://www.vinted.fr/catalog?brand_id[]=53&brand_id[]=88&brand_id[]=362&brand_id[]=73306&brand_id[]=4691320&brand_id[]=2319&catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&price_from=5&currency=EUR&price_to=100&status_ids[]=6&status_ids[]=1&status_ids[]=2'
        },
        {
          title: 'Nike',
          channelId: "1106615894999826502",
          url: 'https://www.vinted.fr/catalog?brand_id[]=53&catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&status_ids[]=2&status_ids[]=1&status_ids[]=6&price_from=5&currency=EUR&price_to=80'
        },
        {
          title: 'Carhartt',
          channelId: "1106616067461218474",
          url: 'https://www.vinted.fr/catalog?catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&status_ids[]=2&status_ids[]=1&status_ids[]=6&price_from=5&currency=EUR&price_to=80&brand_id[]=362'
        },
        {
          title: 'The North Face',
          channelId: "1106616314723835984",
          url: 'https://www.vinted.fr/catalog?catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&status_ids[]=2&status_ids[]=1&status_ids[]=6&price_from=5&currency=EUR&price_to=80&brand_id[]=2319'
        },
        {
          title: 'Stone Island',
          channelId: "1106618022719918180",
          url: 'https://www.vinted.fr/catalog?catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&status_ids[]=2&status_ids[]=1&status_ids[]=6&price_from=5&currency=EUR&brand_id[]=73306&price_to=80'
        },
        {
          title: 'Ralph Lauren',
          channelId: "1106657793085284462",
          url: 'https://www.vinted.fr/catalog?catalog[]=2050&size_id[]=206&size_id[]=207&size_id[]=208&size_id[]=209&brand_id[]=88&price_from=5&currency=EUR&price_to=70&status_ids[]=6&status_ids[]=1&status_ids[]=2'
        }
      ];

      for (const {title, channelId, url} of brands) {
        recursiveChecker(client, title, channelId, url);
      }
    },
}

export default event;