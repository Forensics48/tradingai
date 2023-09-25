const crypto = require('crypto');
const axios = require('axios');

var url = 'https://api-testnet.bybit.com';
var apiKey = "PeZWbGUQ6mtiq6aGxH";
var secret = "E2HSoIihdkr7VktazlxkvV44sdtvSSSgPsjd";
var recvWindow = 40000;
var timestamp = Date.now().toString();

function getSignature(parameters, secret) {
    timestamp = Date.now().toString();
    return crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + parameters).digest('hex');
}

async function http_request(endpoint, method, data, Info) {
    var sign = getSignature(data, secret);
    if (method == "POST") {
        fullendpoint = url + endpoint;
    } else {
        fullendpoint = url + endpoint + "?" + data;
        data = "";
    }
    //endpoint=url+endpoint
    var config = {
        method: method,
        url: fullendpoint,
        headers: {
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': '40000',
            'Content-Type': 'application/json; charset=utf-8'
        }
    };
    if (method == "POST") {
        config.data = data;
    }
    console.log(Info + " Calling....");
    const apiResponse = await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
            return error;
        });
    return apiResponse;
}

async function getAccBalance() {
    endpoint = "/v5/account/wallet-balance";
    var data = 'accountType=UNIFIED';
    await http_request(endpoint, "GET", data, "Account Balance");
}

async function getTickerInfo(symbol) {
    endpoint = "/v5/market/tickers";
    var data = `category=linear&symbol=${symbol}`;
    const reqResponse = await http_request(endpoint, "GET", data, "Ticker Info");
    return reqResponse.result;
}

async function getInstrumentsInfo(symbol) {
    endpoint = "/v5/market/instruments-info";
    var data = `category=linear&symbol=${symbol}`;
    const reqResponse = await http_request(endpoint, "GET", data, "Ticker Info");
    return reqResponse.result;
}

async function openBybitPosition(symbol, side, qty) {
    endpoint="/v5/order/create"
    var data = `{"category":"linear","symbol": "${symbol}","side": "${side}","positionIdx": 0,"orderType": "Market","qty": "${qty}"}`;
    await http_request(endpoint,"POST",data,"Open Position");
}

module.exports = {
    getAccBalance,
    getTickerInfo,
    getInstrumentsInfo,
    openBybitPosition
}