import WebSocket from 'ws';
import { Reader, Writer } from '../shared/v3binlingo.js';
export class Game {
    constructor(link) {
        //this.qtree = new QuadTree([0, 0, constants.MAP.WIDTH, constants.MAP.HEIGHT], this);
        this.wss = new WebSocket.Server({ server: global.hServer, path: '/games/' + link });
        this.wss.on('listening', () => {
            console.log(`Game listening with link /games/${link}`);
        });
        function heartbeat() {
            this.isAlive = true;
        }
        this.messages = [];
        this.wss.on('connection', (socket) => {
            //Connection centric
            socket.isAlive = true;
            socket.on('pong', heartbeat);
            socket.on('close', () => {
                if (socket.player) {
                    let player = socket.player;
                    player.clientHealth = 0;
                }
            });

            //Game centric
            let socketID = v4();
            const binaryPacker = new Writer(37).packInt8(constants.MSG_TYPES.SOCKET_ID).packString(socketID);
            socket.send(binaryPacker.arrayBuffer);
            socket.id = socketID;
            socket.on('message', (m) => {
                this.messages.push([m, socket]);
            });
        });
        const pingPong = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }
}
