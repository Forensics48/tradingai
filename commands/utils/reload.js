const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { reloadTickers } = require('../../discord/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true)
        ),
    async execute(interaction) {
        reloadTickers(interaction)
    }
};
