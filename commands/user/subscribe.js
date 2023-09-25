const { SlashCommandBuilder } = require('discord.js');
//const mongoclient = require('../../mongooo');
const { fetchAllTickers } = require('../../database/functions');
const { createChannelForUser, subscribeUser } = require('../../database/functions');
const { getCryptoTickers } = require('../../utils/global');

/*
async function setTickers() {
	cryptoTickers = getCryptoTickers();
	//stockTickers = fetchedTickers.filter(ticker => ticker.type == 'stock').map(ticker => ({ name: ticker.name, value: ticker.symbol }));
	console.log(cryptoTickers);
}
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subscribe')
		.setDescription('Subscribes to a ticker !')
		.addSubcommand(subcommand =>
			subcommand.setName('crypto')
				.setDescription('Subscribe to a cryptocurrency')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Choose a cryptocurrency')
						.setRequired(true)
						.setAutocomplete(true)
				))
		.addSubcommand(subcommand =>
			subcommand.setName('stock')
				.setDescription('Subscribe to a stock')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Choose a stock')
						.setRequired(true)
						.setAutocomplete(true)
				)),
	async execute(interaction) {
		let message = "Successfully subscribed to";
		try {
			const userId = interaction.user.id;
			const userName = interaction.user.username;
			const userChoice = interaction.options.getString('name');
			const guildId = interaction.guildId;
			const userChannelId = await createChannelForUser(guildId, userId, userName);
			if (userChannelId) {
				const subscribeResponse = await subscribeUser(userId, userName, userChoice, userChannelId);
				if (subscribeResponse == "success") {
				} else if (subscribeResponse == "duplicate") {
					message = "You are already subscribed to";
				} else if (subscribeResponse == "error") {
					message = "Error subscribing to";
				} else {
					message = "Unknown error subscribing to";
				}
			} else {
				message = "Error subscribing to";
			}
			await interaction.reply(`${message} ${userChoice}`);
		} catch (ex) {
			console.log("Error subscribe/subscribe.js execute");
			console.log(ex)
			await interaction.reply(`Unknown error. Contact an administrator.`);
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
			console.log("Error subscribe/subscribe.js autocomplete");
			console.log(ex)
			await interaction.reply(`Unknown error. Contact an administrator.`);
		}
	}
};