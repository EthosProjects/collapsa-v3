import RakureBot from '../rakure/Rakure.js';
import PathosBot from '../pathos/Pathos.js';
import WebSocket from 'ws';
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
    //let ws = new WebSocket('wss://collapsa.io/localbot');
    //ws.on('open', startBots);
    //ws.on('close', stopBots);
} else {
    startBots();
    let wss = new WebSocket.Server({ noServer: true });
    function heartbeat() {
        this.isAlive = true;
    }
    wss.on('connection', (socket) => {
        console.log('localbot connected');
        stopBots();
        socket.isAlive = true;
        socket.on('pong', heartbeat);
        socket.on('close', () => {
            //startBots();
            console.log('localbot disconnected');
        });
    });
    const pingPong = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
}
