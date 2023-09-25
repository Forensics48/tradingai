const dotenv = require("dotenv");
dotenv.config()
const fs = require('node:fs');
const path = require('node:path');
const { client } = require('./client');
const { Collection, REST, Routes } = require('discord.js');
const { setTickers } = require('../commands/user/subscribe');
const { fetchTickers } = require('../utils/global');
const BOT_TOKEN = process.env.DISCORD_TOKEN;
const BOT_APP_ID = process.env.CLIENT_ID;

client.commands = new Collection();
const commands = []
const foldersPath = path.join(__dirname, '../commands');


const commandFolders = fs.readdirSync(foldersPath);


for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(BOT_TOKEN);

async function deployCommands() {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(BOT_APP_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
}

module.exports = {
    deployCommands
}