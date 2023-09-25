const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addTicker } = require('../../database/functions');
const { reloadTickers } = require('../../discord/functions');
const { fetchTickers } = require('../../utils/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addticker')
        .setDescription('Add a ticker !')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addSubcommand(subcommand =>
            subcommand.setName('crypto')
                .setDescription('Add a cryptocurrency ticker')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Tickers Name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('symbol')
                        .setDescription('Tickers TradingView Symbol')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand.setName('stock')
                .setDescription('Add a stocks ticker')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Tickers Name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('symbol')
                        .setDescription('Tickers TradingView Symbol')
                        .setRequired(true)
                )),
    async execute(interaction) {
        try {
            const tickerType = interaction.options.getSubcommand();
            const tickerName = interaction.options.getString('name');
            const tickerSymbol = interaction.options.getString('symbol').toUpperCase();
            await addTicker(tickerName, tickerSymbol, tickerType);
            await fetchTickers();
            await interaction.reply("Successfully added ticker " + tickerName);
        } catch (ex) {
            console.log("Error addTicker execute");
            console.log(ex);
        }
    }
};

/*
async function splitTickersByType() {
    const tickers = await fetchAllTickers();

    const cryptoTickers = tickers.filter(ticker => ticker.type === 'crypto');
    const stockTickers = tickers.filter(ticker => ticker.type === 'stock');

    return { cryptoTickers, stockTickers };
}
*/