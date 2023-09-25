const express = require('express');
const app = express();
const port = 3000;
const { findUsersWithSymbol, updateTicker } = require('../database/functions');
const { sendMessage } = require('../discord/functions');
const { addPosition, closePosition } = require('../positions/positions');
const { formatUserMessage } = require('../utils/global');
// Middleware to parse JSON payloads
app.use(express.json());

// Endpoint to receive webhook from TradingView
app.post('/webhook', async (req, res) => {
    try {
        const position = req.body;
        let name = position.symbol;
        let type = "stock";
        if(position.symbol.includes("USDT")) {
            name = position.symbol.replace(/USDT$/, "");
            type = "crypto";
        }
        const ticker = {
            name : name,
            symbol : position.symbol,
            type : type,
            winrate : position.winrate
        };

        if(position && position.symbol && position.winrate) {
            updateTicker(ticker);
        }
        if (position && position.type == "open") {
            addPosition(position);
            notifyUsers(position);
        } else if (position && position.type == "close") {
            closePosition(position);
        }
    } catch (ex) {
        console.log("server/server.js webhook error")
        console.log(ex);
    }

    res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

async function notifyUsers(position) {
    const usersToNotify = await findUsersWithSymbol(position.ticker);
    if (usersToNotify && usersToNotify.length > 0) {
        usersToNotify.forEach(user => {
            sendMessage(user.channelId, formatUserMessage(position));
        });
    }
}