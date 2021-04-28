import constants from '../v3client/js/constants.js';
import WebSocket from 'ws';
import { Reader, Writer } from '../v3client/js/v3binlingo.js';
import { NativeGame } from '../native/export.js';
import { v4 } from 'uuid';
export class Game {
    constructor(link) {
        this.address = 0x00000000;
        NativeGame.bindInstanceToNative(this);
        this.ssss = function () {
            console.log('3');
        };
        //console.log(this)
        //this.qtree = new QuadTree([0, 0, constants.MAP.WIDTH, constants.MAP.HEIGHT], this);
        this.wss = new WebSocket.Server({ server: global.hServer, path: '/games/' + link });
        this.wss.clientMap = new Map();
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
                /*
                if (socket.player) {
                    let player = socket.player;
                    player.clientHealth = 0;
                }*/
            });
            //console.log(this)
            //Game centric
            let socketID = v4();
            const binaryPacker = new Writer(37).writeUint8(constants.MSG_TYPES.SOCKET_ID).writeString(socketID);
            socket.send(binaryPacker.arrayBuffer);
            socket.id = socketID;
            this.wss.clientMap.set(socketID, socket);
            socket.on('message', (m) => {
                console.log(new Uint8Array(m).buffer);
                this.writeMessage(new Uint8Array(m).buffer, socket);
            });
        });
        const pingPong = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
        const readMessages = () => {
            /**
             * @type {ArrayBuffer[]}
             */
            const messages = this.getMessages();
            if (messages.length == 0) return;
            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];
                if (message.socketid == 0) {
                    continue;
                }
                if (!this.wss.clientMap.has(message.socketid) || this.wss.clientMap.get(message.socketid).closed)
                    continue;
                this.wss.clientMap.get(message.socketid).send(message);
            }
        };
        let previousTick = Date.now();
        const loop = () => {
            let now = Date.now();
            if (previousTick + constants.TICK_SPEED <= now) {
                let delta = (now - previousTick) / 1000;
                previousTick = now;
                readMessages();
                //console.log('delta', delta, '(target: ' + TICK_LENGTH_MS +' ms)', 'node ticks', ticks)
            }
            const after = Date.now();
            if (after - previousTick < constants.TICK_SPEED) {
                setTimeout(loop, constants.TICK_SPEED - (after - previousTick));
            } else {
                setImmediate(loop);
            }
        };
        loop();
    }
}
NativeGame.bindClassToNative(Game);
