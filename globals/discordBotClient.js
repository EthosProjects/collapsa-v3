import CollapsaBot from '../collapsabot/export.js';
import mongoDB from './mongoDB.js';
const discordBotClient = new CollapsaBot(mongoDB);
discordBotClient.initialize();
console.log('trying to start');
export default discordBotClient;
