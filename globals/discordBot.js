import RakureBot from '../rakure/Rakure.js';
import PathosBot from '../pathos/Pathos.js';
import Websocket from 'ws';
const Rakure = new RakureBot();
const Pathos = new PathosBot();
await Rakure.initialize();
await Pathos.initialize();
export const startBots = async () => {
    await Rakure.login(Rakure.TOKEN).catch(console.error);
    await Pathos.login(Pathos.TOKEN).catch(console.error);
};
export const stopBots = () => {
    Rakure.destroy();
    Pathos.destroy();
};
if (process.env.NODE_ENV == 'development') {
    let ws = new Websocket('wss://collapsa.io/localbot');
    ws.on('open', startBots);
    ws.on('close', stopBots);
} else {
    startBots();
}
