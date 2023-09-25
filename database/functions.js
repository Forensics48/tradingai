const cron = require('node-cron');
const dotenv = require("dotenv");
dotenv.config()
const databaseClient = require('./client').client;
const { createChannel } = require('../discord/functions');

const dbName = process.env.DATABASE_NAME;
const userCollectionName = process.env.DATABASE_USERS_COLLECTION_NAME;
const tickerCollectionName = process.env.DATABASE_TICKERS_COLLECTION_NAME;

async function subscribeUser(userId, username, symbol, channelId) {
    try {
        const db = databaseClient.db(dbName);
        const userCollection = db.collection(userCollectionName);
        const user = await userCollection.findOne({ _id: userId });

        if (!user) {
            // If the user is not in the database, add them
            await userCollection.insertOne({
                _id: userId,
                username: username,
                subscribedSymbols: [symbol],
                channelId: channelId // This will be set when you create the channel
            });

            return "success";
        } else {
            // If the user is already in the database, just add the symbol to their subscribedSymbols array
            const result = await userCollection.updateOne(
                { _id: userId },
                { $addToSet: { subscribedSymbols: symbol } } // $addToSet ensures no duplicates
            );
            if (result.modifiedCount === 0) {
                return "duplicate";
            } else {
                return "success";
            }
        }
    } catch (ex) {
        console.log("Error database/functions.js subscribeUser");
        console.log(ex);
        return "error";
    }
}

// Adds a ticker to the collection
async function addTicker(name, symbol, type) {
    const db = databaseClient.db(dbName);
    const tickerCollection = db.collection(tickerCollectionName);

    const ticker = await tickerCollection.findOne({ symbol: symbol });

    if (!ticker) {
        await tickerCollection.insertOne({
            name: name,
            symbol,
            type
        });
    } else {
        await tickerCollection.updateOne(
            { symbol: symbol }
        );
    }
}

async function updateTicker(data) {
    const db = databaseClient.db(dbName);
    const tickerCollection = db.collection(tickerCollectionName);

    const query = { symbol: data.ticker };

    // Prepare the new or updated document
    const update = {
        $set: {
            name: data.name,
            symbol: data.symbol,
            type: data.type,  // set the type as "crypto"
            winrate: data.winrate
        },
    };

    // Use upsert: true to insert a new document if one doesn't already exist
    const options = { upsert: true };

    const result = await tickerCollection.updateOne(query, update, options);

    if (result.matchedCount > 0) {
        console.log(`Successfully matched and/or modified ${result.matchedCount} document(s).`);
    } else {
        console.log(`No document matched the provided query. A new document was inserted with _id: ${result.upsertedId._id}`);
    }
}

async function addSubscription(userId, daysToAdd) {
    const db = databaseClient.db(dbName);
    const userCollection = db.collection(userCollectionName);

    const userInDb = await userCollection.findOne({ _id: userId });
    if (userInDb && userInDb.channelId) {
        const currentUnixTime = new Date().getTime(); // or +new Date();
        const timeToAdd = daysToAdd * 24 * 60 * 60 * 1000;
        const newUnixTime = currentUnixTime + timeToAdd;

        // Filter for the user you want to update
        const filter = { _id: userInDb._id };  // Replace 'someUsername' with the actual username

        // Data to be updated
        const updateData = {
            $set: {
                "subscription.type": "premium", // Replace 'premium' with the actual type
                "subscription.expires": newUnixTime // 3 days from now in Unix time
            }
        };

        const result = await userCollection.updateOne(filter, updateData);
        console.log(`Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s)`);
    }
}

async function removeExpiredSubscriptions() {
    try {
        const db = databaseClient.db(dbName);
        const userCollection = db.collection(userCollectionName);

        const currentTime = new Date().getTime();
        // Update the documents where the subscription has expired
        const result = await userCollection.updateMany(
            { "subscription.expires": { $lt: currentTime } },
            { $set: { "subscription.type": "free" } }
        );

        console.log(`${result.modifiedCount} document(s)`);
    } catch (err) {
        console.error(err);
    }
}


// Returns all available tickers
async function fetchAllTickers() {
    const db = databaseClient.db(dbName);
    const tickerCollection = db.collection(tickerCollectionName);
    if (tickerCollection) {
        return await tickerCollection.find({}).toArray();
    }
}

async function getSymbolWinrate(symbol) {
    const db = databaseClient.db(dbName);
    const tickerCollection = db.collection(tickerCollectionName);

    const result = await tickerCollection.findOne({ symbol: symbol });

    if (result) {
        return result.winrate;
    } else {
        console.log(`Document with symbol ${symbol} not found.`);
        return null;
    }
}

async function createChannelForUser(guildId, userId, userName) {
    try {
        const db = databaseClient.db(dbName);
        const userCollection = db.collection(userCollectionName);
        // Check if the user already has a channel
        const userInDb = await userCollection.findOne({ _id: userId });
        if (userInDb && userInDb.channelId) {
            return userInDb.channelId; // If they have a channel already, just return the ID
        } else {
            const channelId = await createChannel(guildId, userId, userName);
            if (channelId) {
                // Save the channel ID to the database
                await userCollection.updateOne(
                    { _id: userId },
                    { $set: { channelId: channelId } }
                );
            }
            return channelId;
        }
    } catch (ex) {
        console.log("Error database/functions.js createChannelForUser");
        console.log(ex);
        return null;
    }
}

async function findUsersWithSymbol(symbol) {
    try {
        // Connect to the MongoDB cluster
        // Specify the database and collection
        const db = databaseClient.db(dbName);
        const collection = db.collection(userCollectionName);

        // Find users who have the symbol in their 'subscribedSymbols' array
        const query = { subscribedSymbols: symbol };
        const projection = { channelId: 1 };

        const cursor = collection.find(query, { projection });
        const usersWithSymbol = [];

        await cursor.forEach(doc => {
            usersWithSymbol.push(doc);
        });

        return usersWithSymbol;

    } catch (ex) {
        console.log("Error database/functions.js findUsersWithSymbol");
        console.log(ex);
        return null;
    }
}

removeExpiredSubscriptions();
cron.schedule('0 */2 * * *', removeExpiredSubscriptions);

module.exports = {
    subscribeUser,
    addTicker,
    updateTicker,
    getSymbolWinrate,
    addSubscription,
    fetchAllTickers,
    createChannelForUser,
    findUsersWithSymbol
}