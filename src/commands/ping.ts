import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { EmbedBuilder } from "@discordjs/builders";


const commandName = 'ping';
const commandDescription = 'Affiche le ping du bot';

export const command: SlashCommand = {
  name: commandName,
  data: new SlashCommandBuilder().setName(commandName).setDescription(commandDescription),
  execute: async (interaction) => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Pong !\n Ping : ' + interaction.client.ws.ping + 'ms')
      ],
    });
  }
}