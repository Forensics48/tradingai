const mongoDb = require('./database/client');
const { fetchTickers } = require('./utils/global');
const discordCommandsManager = require('./discord/commandsManager');
require('./server/server');

(async () => {
	await mongoDb.connect();
	await fetchTickers();
	await discordCommandsManager.deployCommands();
})();
