const discordClient = require('./client').client;
const { ChannelType, PermissionFlagsBits } = require('discord.js');

async function createChannel(guildId, userId, userName) {
    try {
        const guild = await discordClient.guilds.fetch(guildId);
        let cate = guild.channels.cache.find(
            (c) => c.name.toLowerCase() === "signals")

        const channel = await guild.channels.create({
            name: `updates-for-${userName}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: PermissionFlagsBits.ViewChannel,
                },
                {
                    id: userId,
                    allow: PermissionFlagsBits.ViewChannel,
                },
            ]
        });

        channel.setParent(cate);

        return channel.id;
    } catch (ex) {
        console.log("Error discord/functions.js createChannel");
        console.log(ex);
        return null;
    }
}

async function sendMessage(channelId, message) {
    try {
        const targetChannel = discordClient.channels.cache.get(channelId);

        // Check if the channel exists
        if (targetChannel) {

            targetChannel.send(message);
        } else {
            console.log(`Channel ${channelId} not found`);
        }
    } catch (ex) {
        console.log("Error discord/functions.js sendMessage");
        console.log(ex);
    }
}

async function reloadTickers(interaction) {
    const command = interaction.client.commands.get('subscribe');

    if (!command) {
        return interaction.reply(`There is no command with name \`${commandName}\`!`);
    }

    delete require.cache[require.resolve(`../commands/subscribe/subscribe.js`)];

    try {
        interaction.client.commands.delete('subscribe');
        const newCommand = require(`../commands/user/subscribe.js`);
        interaction.client.commands.set('subscribe', newCommand);
        //interaction.sendMessage(`Command \`${newCommand.data.name}\` was reloaded!`)
        //await interaction.reply();
    } catch (error) {
        console.error(error);
        await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
    }
}

module.exports = {
    createChannel,
    sendMessage,
    reloadTickers
}