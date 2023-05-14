import { Client, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent, SlashCommand } from "../types";

module.exports = async (client: Client) => {

    const body: any[] = []
    let slashCommandsDir = join(__dirname, "../commands")

    readdirSync(slashCommandsDir).forEach(file => {
        if (!file.endsWith(".js") && !file.endsWith('.ts')) return;

        const command: SlashCommand = require(`${slashCommandsDir}/${file}`).command;
        console.log(command)
        body.push(command.data.toJSON());
        client.slashCommands.set(command.name, command);
    })

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: body });
    } catch (error) {
        console.log('error: ', error)
    }
    
}