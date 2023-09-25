const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { reloadTickers } = require('../../discord/functions');
const { getCryptoTickers } = require('../../utils/global');
const { getSymbolWinrate } = require('../../database/functions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('winrate')
        .setDescription('Display the winrate of a symbol')
		.addSubcommand(subcommand =>
			subcommand.setName('crypto')
				.setDescription('Winrate of a cryptocurrency')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Choose a cryptocurrency')
						.setRequired(true)
						.setAutocomplete(true)
				))
		.addSubcommand(subcommand =>
			subcommand.setName('stock')
				.setDescription('Winrate of a stock')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Choose a stock')
						.setRequired(true)
						.setAutocomplete(true)
				)),
    async execute(interaction) {
        let symbolName = interaction.options.getString('name');
        let winrate = await getSymbolWinrate(symbolName);
        if (winrate) {
            winrate = (winrate * 100).toFixed(2);
            await interaction.reply(`Winrate for ${symbolName} is currently at ${winrate}%.`);
        }
    },
    async autocomplete(interaction) {
        try {
            let choices = getCryptoTickers();
            let subcommandChoice = interaction.options.getSubcommand();
            if (subcommandChoice == "stock") {
                choices = stockTickers;
            }
            const focusedValue = interaction.options.getFocused();
            const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
            await interaction.respond(
                filtered.map(choice => ({ name: choice.name, value: choice.value })),
            );
        } catch (ex) {
            console.log("Error winrate/winrate.js autocomplete");
            console.log(ex)
            await interaction.reply(`Unknown error. Contact an administrator.`);
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