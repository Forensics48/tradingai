const { MongoClient } = require('mongodb');
const dotenv = require("dotenv");
dotenv.config()

const uri = process.env.DATABASE_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let isConnected = false

async function connect() {
    try {
        isConnected = true;
        await client.connect();
        console.log("Successfully connected to MongoDB.");
      } catch (error) {
        isConnected = false;
        console.error("Error connecting to MongoDB: ", error);
      }
}

async function close() {
    if (isConnected) {
        await client.close();
        isConnected = false;
    }
}

module.exports = {
    client,
    connect,
    close
}