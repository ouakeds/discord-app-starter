import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const commandName = 'options';
const commandDescription = 'description';

export const command: SlashCommand = {
  name: commandName,
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(commandDescription)
    .addStringOption(option => option.setName('message').setDescription('Message à envoyer').setRequired(true))
  ,
  execute: async (interaction) => {
    const message = await interaction.options.get('message')?.value?.toString();
    await interaction.reply({content: `Valeur du message: ${message}`, fetchReply: true});
  }
}