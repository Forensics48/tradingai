const dotenv = require("dotenv");
dotenv.config();
const { getAccBalance, getTickerInfo, getInstrumentsInfo, openBybitPosition, closeBybitPosition } = require('../bybit/bybit');
const { sendMessage } = require('../discord/functions');
const { formatUserMessage } = require('../utils/global');

var positions = [];
const viableTickers = ['DOGEUSDT', 'BTCUSDT', "SOLUSDT", "ETHUSDT"];
const buyPower = 1000;
const positionsChannelId = process.env.POSITIONS_CHANNEL;

async function addPosition(position) {
    if (viableTickers.includes(position.ticker)) {
        const tickerInfo = await getTickerInfo(position.ticker);
        const tickerMarketPrice = tickerInfo.list[0].markPrice;
        const instrumentsInfo = await getInstrumentsInfo(position.ticker);
        const tickSize = instrumentsInfo.list[0].lotSizeFilter.qtyStep;
        const qty = await calculateQuantity(tickerMarketPrice, tickSize);
        newPosition = {
            tickerName: position.ticker,
            tickerMarketPrice: tickerMarketPrice,
            positionQuantity: qty,
            positionSide: position.side
        }
        positions.push(newPosition);
        openBybitPosition(position.ticker, position.side, qty);
        sendMessage(positionsChannelId, formatUserMessage(position));
    }
}

async function closePosition(positionInfo) {
    if (viableTickers.includes(positionInfo.ticker)) {
        const positionToClose = positions.find(position => position.tickerName === positionInfo.ticker);
        if (positionToClose) {
            let side = positionToClose.positionSide == "Buy" ? "Sell" : "Buy";
            openBybitPosition(positionToClose.tickerName, side, positionToClose.positionQuantity);
            // The position exists, so you can now proceed to close it
            console.log(`Found position to close: `, positionToClose);    
            sendMessage(positionsChannelId, formatUserMessage(positionToClose));
        } else {
            console.log(`Position with ticker name ${positionInfo.ticker} not found.`);
        }
    }
}

async function clearPositions() {
    for (var position in positions) {
        closePosition(position);
    }
}

async function getPositions() {
    return positions;
}

async function calculateQuantity(tickerMarkPrice, tickStep) {
    let rawQuantity = buyPower / tickerMarkPrice;
    let quantity = (Math.floor(rawQuantity / tickStep) * tickStep).toFixed(5);
    return quantity;
}

module.exports = {
    addPosition,
    closePosition,
    clearPositions,
    getPositions
}