const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addSubscription } = require('../../database/functions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsubscription')
        .setDescription('Add a subscription !')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('Users ID')
                .setRequired(true)
            // ... add other choices
        )
        .addStringOption(option =>
            option.setName('days')
                .setDescription('How many days subscription')
                .setRequired(true)
            // ... add other choices
        ),
    async execute(interaction) {
        try {
            const userId = interaction.options.getString('userid');
            const subscriptionDays = interaction.options.getString('days');
            await addSubscription(userId, subscriptionDays);
            await interaction.reply(`Successfuly added ${subscriptionDays} days to <@${userId}>`);
        } catch (ex) {
            console.log("Error addsubscription execute");
            console.log(ex);
        }
    }
};
