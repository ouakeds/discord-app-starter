import { BotEvent } from "../types";
import { Client, Events, Interaction} from "discord.js";

const event: BotEvent = {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command) return;

        await command.execute(interaction);
    },
}

export default event;