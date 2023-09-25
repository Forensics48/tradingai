const { fetchAllTickers } = require('../database/functions');


let newCryptoTickers = [{ name: "Empty", value: "Empty" }];
let newStockTickers = [{ name: "Empty", value: "Empty" }];

async function fetchTickers() {
	const fetchedTickers = await fetchAllTickers();
	newCryptoTickers = fetchedTickers.filter(ticker => ticker.type == 'crypto').map(ticker => ({ name: ticker.name, value: ticker.symbol }));
	stockTickers = fetchedTickers.filter(ticker => ticker.type == 'stock').map(ticker => ({ name: ticker.name, value: ticker.symbol }));
}

function getCryptoTickers() {
    return newCryptoTickers;
}

function getStockTickers() {
    return newStockTickers;
}

function formatUserMessage(position) {
    const timestampSeconds = Math.floor(position.time / 1000);
    const winratePerc = (position.winrate * 100).toFixed(2);
    const message = `[<t:${timestampSeconds}:T>] ${position.ticker} ${position.type} ${position.side} @${position.price} (${winratePerc}% Winrate)`
    return message;
}

module.exports = {
    fetchTickers,
    getCryptoTickers,
    getStockTickers, 
    formatUserMessage
}