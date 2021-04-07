import CollapsaBot from '../collapsabot/export.js';
import mongoDB from './mongoDB.js';
const discordBotClient = new CollapsaBot(mongoDB);
discordBotClient.initialize();
export default discordBotClient;
