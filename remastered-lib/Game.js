import WebSocket from 'ws';
import { v4 } from 'uuid';
import fs from 'fs';
/**
 * @type {Map<string, Game>}
 */
export const Games = new Map();
global.Games = Games;

const items = JSON.parse(fs.readFileSync('./items.json', 'utf8'));
import { binaryWriter, binaryUnpacker } from '../shared/binary.js';
import epoch from '../epoch.js';
const hrtimeMs = (date) => {
    let time = process.hrtime();
    return time[0] * 1000000 + time[1] - (date || 0);
};
const getEpochDate = (date) => Date.now() - epoch - (date || 0);
import { Player, Tree, Stone } from './Entities/export.js';
import { StorageMethods, LeaderboardMethods, getArrayChange } from './util/export.js';
import QuadTree from '../shared/QuadTree.js';
import constants from '../shared/constants.js';
import { Collection } from 'discord.js';
import { fileURLToPath } from 'url';
/**
 * This is the game :)
 */
export class Game {
    constructor(link) {
        this.qtree = new QuadTree([0, 0, constants.MAP.WIDTH, constants.MAP.HEIGHT], this);
        this.wss = new WebSocket.Server({ server: global.hServer, path: '/' + link });
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
            const binaryPacker = new binaryWriter(37);
            binaryPacker.packInt8(constants.MSG_TYPES.SOCKET_ID);
            binaryPacker.packString(socketID);
            socket.send(binaryPacker.arrayBuffer);
            socket.id = socketID;
            let clientPlayer;
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
        this.PlayerCount = 0;
        this.leaderboard = new ArrayBuffer(constants.PLAYER.LIMIT);
        this.droppedItems = [];
        this.droppedItems.new = [];
        /**
         * @type {Array.<Player>}
         */
        this.Players = new Array(constants.PLAYER.LIMIT).fill(undefined);
        this.TreeCount = 0;
        /**
         * @type {Array.<Tree>}
         */
        this.Trees = new Array(constants.TREE.LIMIT).fill(undefined);
        this.StoneCount = 0;
        /**
         * @type {Array.<Stone>}
         */
        this.Stones = new Array(constants.STONE.LIMIT).fill(undefined);
        this.Walls = new ArrayBuffer(constants.PLAYER.LIMIT * constants.PLAYER.WALL_LIMIT * 8);
        const addWall = (data) => {
            let id = ((data[5] << 8) + data[6]) * 8;
            const wallUInt = new Uint8Array(this.Walls);
            for (let i = 0; i < data.length; i++) wallUInt[id + i] = data[i];
            this.qtree.insert(data);
        };
        /*addWall([3, 0, 0, 0, 0, 0, 0, constants.MATERIAL.WOOD]);
        addWall([3, 0, 64, 0, 0, 0, 1, constants.MATERIAL.WOOD]);
        addWall([3, 0, 128, 0, 0, 0, 2, constants.MATERIAL.WOOD]);
        addWall([3, 0, 192, 0, 0, 0, 3, constants.MATERIAL.WOOD]);
        addWall([3, 1, 0, 0, 0, 0, 4, constants.MATERIAL.WOOD]);*/

        const TICK_LENGTH_MS = constants.TICK_SPEED;
        this.ticks = 0;
        let previousTick = Date.now();
        const loop = () => {
            let now = Date.now();
            if (previousTick + TICK_LENGTH_MS <= now) {
                this.ticks++;
                let delta = (now - previousTick) / 1000;
                previousTick = now;
                this.readMessages();
                this.update(delta);
                //console.log('delta', delta, '(target: ' + TICK_LENGTH_MS +' ms)', 'node ticks', ticks)
            }
            const after = Date.now();
            if (after - previousTick < TICK_LENGTH_MS) {
                setTimeout(loop, TICK_LENGTH_MS - (after - previousTick));
            } else {
                setImmediate(loop);
            }
        };
        loop();
        this.frameStamp = Date.now();
        this.loggedBefore = false;
        Games.set(link, this);
    }
    readMessages() {
        for (let i = 0; i < this.messages.length; i++) {
            let m = this.messages[i][0];
            let socket = this.messages[i][1];
            const MSG_TYPES = constants.MSG_TYPES;
            let binaryReader = new binaryUnpacker(new Uint8Array(m));
            let messageType = binaryReader.unpackInt8();
            /**
             * @type {Player}
             */
            let clientPlayer = socket.player;
            switch (messageType) {
                case MSG_TYPES.JOIN_GAME:
                    if (this.PlayerCount === constants.PLAYER.LIMIT) {
                        socket.send(new Uint8Array([constants.MSG_TYPES.GAME_FULL]).buffer);
                        break;
                    } else socket.send(new Uint8Array([constants.MSG_TYPES.GAME_LOADING]).buffer);
                    let getGoodPosition = () => {
                        let pos = {
                            x: 30 + Math.floor(Math.random() * (constants.MAP.WIDTH - 60)),
                            y: 30 + Math.floor(Math.random() * (constants.MAP.HEIGHT - 60)),
                        };
                        if (
                            this.qtree.circleCircleCollisions({
                                position: pos,
                                radius: 30,
                            }).length !== 0
                        )
                            return getGoodPosition();
                        else return pos;
                    };
                    let start = hrtimeMs();
                    let position = getGoodPosition();
                    socket.gameView = this.qtree.retrieveSorted([
                        position.x - 750 * (64 / 100),
                        position.y - 400 * (64 / 100),
                        1500 * (64 / 100),
                        800 * (64 / 100),
                    ]);
                    const binaryPacker = new binaryWriter(
                        6 +
                            socket.gameView[0].length * 25 +
                            socket.gameView[1].length * 5 +
                            socket.gameView[2].length * 5 +
                            socket.gameView[3].length * 7,
                    );
                    binaryPacker.packInt8(constants.MSG_TYPES.GAME_STATE);
                    binaryPacker.packInt8(socket.gameView[0].length);
                    binaryPacker.packInt8(socket.gameView[1].length);
                    binaryPacker.packInt8(socket.gameView[2].length);
                    binaryPacker.packInt16(socket.gameView[3].length);
                    for (let i = 0; i < socket.gameView[0].length; i++) {
                        let player = this.Players[socket.gameView[0][i]];
                        binaryPacker.packInt8(player.id);
                        binaryPacker.packInt16(player.position.x);
                        binaryPacker.packInt16(player.position.y);
                        binaryPacker.packInt8(player.velocity.x);
                        binaryPacker.packInt8(player.velocity.y);
                        binaryPacker.packInt8((player.rotation * 255) / Math.PI / 2);
                        binaryPacker.packInt8(player.hand.id);
                        binaryPacker.packString(player.usr, 16);
                    }
                    for (let i = 0; i < socket.gameView[1].length; i++) {
                        let tree = this.Trees[socket.gameView[1][i]];
                        binaryPacker.packInt8(tree.id);
                        binaryPacker.packInt16(tree.position.x);
                        binaryPacker.packInt16(tree.position.y);
                    }
                    for (let i = 0; i < socket.gameView[2].length; i++) {
                        let stone = this.Stones[socket.gameView[2][i]];
                        binaryPacker.packInt8(stone.id);
                        binaryPacker.packInt16(stone.position.x);
                        binaryPacker.packInt16(stone.position.y);
                    }
                    for (let i = 0; i < socket.gameView[3].length; i++) {
                        let wallUInt = new Uint8Array(this.Walls);
                        let x =
                            (wallUInt[socket.gameView[3][i] * 8 + 1] << 8) + wallUInt[socket.gameView[3][i] * 8 + 2];
                        let y =
                            (wallUInt[socket.gameView[3][i] * 8 + 3] << 8) + wallUInt[socket.gameView[3][i] * 8 + 4];
                        binaryPacker.packInt16(x);
                        binaryPacker.packInt16(y);
                        binaryPacker.packInt16(socket.gameView[3][i]);
                        binaryPacker.packInt8(wallUInt[socket.gameView[3][i] * 8 + 7]);
                    }
                    socket.send(binaryPacker.arrayBuffer);
                    let player = new Player(binaryReader.unpackString(16), this, socket.id);
                    player.position = position;
                    player.socket = socket;
                    socket.player = player;
                    LeaderboardMethods.addPlayer(this.leaderboard, player.id, this);
                    console.log('Game join took ', (hrtimeMs() - start) / 1000000, ' milliseconds');
                    break;
                case MSG_TYPES.INPUT:
                    if (this.Players[clientPlayer.id] != clientPlayer) break;
                    let key = binaryReader.unpackInt8();
                    let pressingAttack = binaryReader.unpackInt8();
                    if (key < 0) key = 0;
                    if (key & 1) clientPlayer.velocity.y = -1;
                    else if (key & 4) clientPlayer.velocity.y = 1;
                    else clientPlayer.velocity.y = 0;

                    if (key & 2) clientPlayer.velocity.x = -1;
                    else if (key & 8) clientPlayer.velocity.x = 1;
                    else clientPlayer.velocity.x = 0;
                    if (pressingAttack) {
                        clientPlayer.move.pressingAttack = true;
                        if (clientPlayer.readyToHit) {
                            clientPlayer.hand.use = true;
                        }
                    } else {
                        clientPlayer.move.pressingAttack = false;
                    }
                    //d == 1000 => 1000/3000
                    clientPlayer.rotation = (((binaryReader.unpackInt8() * 360) / 255) * Math.PI) / 180;
                    clientPlayer.mouseDis = binaryReader.unpackInt8();
                    break;
                case MSG_TYPES.CRAFT_ITEM:
                    if (this.Players[clientPlayer.id] != clientPlayer) break;
                    StorageMethods.craftItem(
                        clientPlayer.inventory,
                        StorageMethods.arrayToBuffer([binaryReader.unpackInt8(), 1]),
                    );
                    break;
                case MSG_TYPES.EQUIP_ITEM:
                    if (this.Players[clientPlayer.id] != clientPlayer) break;
                    if (!clientPlayer.readyToHit) break;
                    let slotNum = binaryReader.unpackInt8();
                    let inventoryInt8 = new Uint8Array(clientPlayer.inventory);
                    if (items[inventoryInt8[slotNum]].data[3] === 0) break;
                    if (clientPlayer.hand.slot === slotNum) {
                        clientPlayer.hand.id = 0;
                        clientPlayer.hand.slot = -1;
                    } else {
                        clientPlayer.hand.id = inventoryInt8[slotNum];
                        clientPlayer.hand.slot = slotNum;
                    }
                    break;
                case MSG_TYPES.DROP_ITEM: {
                    if (this.Players[clientPlayer.id] != clientPlayer) break;
                    if (!clientPlayer.readyToHit) break;
                    let slotNum = binaryReader.unpackInt8();
                    let inventoryInt8 = new Uint8Array(clientPlayer.inventory);
                    const item = {
                        itemid: inventoryInt8[slotNum],
                        id: this.droppedItems.length ? this.droppedItems[this.droppedItems.length - 1].id + 1 : 0,
                        count: inventoryInt8[slotNum + 1],
                        x: clientPlayer.position.x,
                        y: clientPlayer.position.y,
                        start: getEpochDate(),
                    };
                    this.droppedItems.push(item);
                    this.droppedItems.new.push(item);
                    inventoryInt8[slotNum] = 0;
                    inventoryInt8[slotNum + 1] = 0;
                    if (clientPlayer.hand.slot === slotNum) {
                        clientPlayer.hand.id = 0;
                        clientPlayer.hand.slot = -1;
                    }
                    break;
                }
                case MSG_TYPES.ACTION_KEY: {
                    if (this.Players[clientPlayer.id] != clientPlayer) break;
                    if (!clientPlayer.readyToHit) break;
                    if (this.droppedItems.length) {
                        const possible = new Collection();
                        for (let i = 0; i < this.droppedItems.length; i++) {
                            const item = this.droppedItems[i];
                            const dis = Math.sqrt(
                                (clientPlayer.position.x - item.x) ** 2 + (clientPlayer.position.y - item.y) ** 2,
                            );
                            if (dis < 32 + clientPlayer.radius) possible.set(dis, [item, i]);
                        }
                        let dis;
                        let nearest;
                        if (possible.size) {
                            for (const [key, value] of possible) {
                                if (!nearest) {
                                    nearest = value;
                                    dis = key;
                                } else if (key < dis) {
                                    nearest = value;
                                    dis = key;
                                }
                            }
                        }
                        if (!nearest) break;
                        const [item, index] = nearest;
                        StorageMethods.addItem(
                            clientPlayer.inventory,
                            new Uint8Array([item.itemid, item.count]).buffer,
                        );
                        this.droppedItems.splice(index, 1);
                        break;
                    }
                    break;
                }
            }
        }
        this.messages = [];
    }
    update(delta) {
        const updateStartTime = hrtimeMs();
        for (let i = 0; i < constants.TREE.LIMIT; i++) {
            if (!this.Trees[i]) new Tree(this);
        }
        for (let i = 0; i < constants.STONE.LIMIT; i++) {
            if (!this.Stones[i]) new Stone(this);
        }
        this.frameStamp = Date.now();
        let clients = [...this.wss.clients];
        if (!clients.length) return;
        if (!this.PlayerCount) return;
        const binaryPacker = new binaryWriter(2 + this.PlayerCount * 10 + 4);
        binaryPacker.packInt8(constants.MSG_TYPES.GAME_UPDATE);
        binaryPacker.packInt8(this.PlayerCount);
        let start = hrtimeMs();
        let index = 0;
        for (let i = 0, j = 0; j < this.PlayerCount; i++) {
            let player = this.Players[i];
            if (this.Players[i] === undefined) continue;
            else j++;
            player.update(delta);
        }
        //let colStart = hrtimeMs();
        this.qtree.arrange();
        this.qtree.deactivateNodes();
        this.qtree.finishArrangement();
        //console.log(`Collision Detection took ${hrtimeMs(colStart)/1000000} milliseconds`)
        for (let i = 0, j = 0; j < this.PlayerCount; i++) {
            let player = this.Players[i];
            if (this.Players[i] === undefined) continue;
            else j++;
            if (player.health <= 0) player.die();
        }
        //console.log(`Player update and packaging ${hrtimeMs(start)/1000000} milliseconds`)
        //const sendUpdateStartTime = hrtimeMs()
        LeaderboardMethods.sortPlayers(this.leaderboard, this);
        if (this.ticks % 1 === 0) this.sendUpdate(binaryPacker);
        if (this.ticks % 10 === 5) this.sendLeaderboard();
        //console.log(`Sending messages took ${(hrtimeMs(sendUpdateStartTime))/1000000} milliseconds`)
        //console.log(`Update took ${hrtimeMs(updateStartTime)/1000000} milliseconds`)
    }
    sendUpdate() {
        let clients = [...this.wss.clients];
        if (this.droppedItems.new.length) {
            const droppedItemsWriter = new binaryWriter(2 + this.droppedItems.length * 12);
            droppedItemsWriter.packInt8(constants.MSG_TYPES.DROPPED_ITEMS_ADD);
            droppedItemsWriter.packInt8(this.droppedItems.new.length);
            for (let i = 0; i < this.droppedItems.new.length; i++) {
                const item = this.droppedItems.new[i];
                droppedItemsWriter.packInt8(item.itemid);
                droppedItemsWriter.packInt16(item.id);
                droppedItemsWriter.packInt8(item.count);
                droppedItemsWriter.packInt16(item.x);
                droppedItemsWriter.packInt16(item.y);
                droppedItemsWriter.packInt32(item.start);
            }
            this.droppedItems.new = [];
            for (let i = 0; i < clients.length; i++) clients[i].send(droppedItemsWriter.arrayBuffer);
        }
        for (let i = 0; i < clients.length; i++) {
            if (!clients[i].player) continue;
            /**
             * @type {Player}
             */
            let clientPlayer = clients[i].player;
            let socket = clients[i];
            //Message Type, inventory size, inventory, stats, damage size, damages
            let binaryPackerPersonal = new binaryWriter(
                7 + 2 * clientPlayer.inventory.byteLength + clientPlayer.damages.length * 9,
            );
            binaryPackerPersonal.packInt8(constants.MSG_TYPES.SELF_UPDATE);
            binaryPackerPersonal.packInt8(clientPlayer.inventory.byteLength);
            binaryPackerPersonal.packBuffer(new Uint8Array(clientPlayer.inventory));
            binaryPackerPersonal.packInt8(clientPlayer.damages.length);
            //[0, 10, 250, Date.now()]
            for (let i = 0; i < clientPlayer.damages.length; i++) {
                binaryPackerPersonal.packInt8(clientPlayer.damages[i][0]);
                binaryPackerPersonal.packInt16(clientPlayer.damages[i][1]);
                binaryPackerPersonal.packInt16(clientPlayer.damages[i][2]);
                binaryPackerPersonal.packInt32(clientPlayer.damages[i][3]);
            }
            binaryPackerPersonal.packInt8(clientPlayer.clientHealth);
            binaryPackerPersonal.packInt8(clientPlayer.maxHealth);
            binaryPackerPersonal.packInt8(clientPlayer.stamina);
            binaryPackerPersonal.packInt8(clientPlayer.maxStamina);
            clients[i].send(binaryPackerPersonal.arrayBuffer);
            let currView = this.qtree.retrieveSorted([
                clientPlayer.position.x - 750 * (64 / 100),
                clientPlayer.position.y - 400 * (64 / 100),
                1500 * (64 / 100),
                800 * (64 / 100),
            ]);
            let [toAdd, toRemove] = getArrayChange(socket.gameView, currView);
            const newEntityPacker = new binaryWriter(
                6 + toAdd[0].length * 61 + toAdd[1].length * 5 + toAdd[2].length * 5 + toAdd[3].length * 7,
            );
            if (newEntityPacker.arrayBuffer.byteLength !== 6) {
                newEntityPacker.packInt8(constants.MSG_TYPES.ADD_ENTITY);
                newEntityPacker.packInt8(toAdd[0].length);
                newEntityPacker.packInt8(toAdd[1].length);
                newEntityPacker.packInt8(toAdd[2].length);
                newEntityPacker.packInt16(toAdd[3].length);
                for (let i = 0; i < toAdd[0].length; i++) {
                    let player = this.Players[toAdd[0][i]];
                    newEntityPacker.packInt8(player.id);
                    newEntityPacker.packInt16(player.position.x);
                    newEntityPacker.packInt16(player.position.y);
                    newEntityPacker.packInt8(player.velocity.x);
                    newEntityPacker.packInt8(player.velocity.y);
                    newEntityPacker.packInt8((player.rotation * 255) / Math.PI / 2);
                    newEntityPacker.packInt8(player.hand.id);
                    newEntityPacker.packString(player.socketID);
                    newEntityPacker.packString(player.usr, 16);
                }
                for (let i = 0; i < toAdd[1].length; i++) {
                    let tree = this.Trees[toAdd[1][i]];
                    newEntityPacker.packInt8(tree.id);
                    newEntityPacker.packInt16(tree.position.x);
                    newEntityPacker.packInt16(tree.position.y);
                }
                for (let i = 0; i < toAdd[2].length; i++) {
                    let stone = this.Stones[toAdd[2][i]];
                    newEntityPacker.packInt8(stone.id);
                    newEntityPacker.packInt16(stone.position.x);
                    newEntityPacker.packInt16(stone.position.y);
                }
                for (let i = 0; i < toAdd[3].length; i++) {
                    let wallUInt = new Uint8Array(this.Walls);
                    let x = (wallUInt[toAdd[3][i] * 8 + 1] << 8) + wallUInt[toAdd[3][i] * 8 + 2];
                    let y = (wallUInt[toAdd[3][i] * 8 + 3] << 8) + wallUInt[toAdd[3][i] * 8 + 4];

                    newEntityPacker.packInt16(x);
                    newEntityPacker.packInt16(y);
                    newEntityPacker.packInt16(toAdd[3][i]);
                    newEntityPacker.packInt8(wallUInt[toAdd[3][i] * 8 + 7]);
                }
                socket.send(newEntityPacker.arrayBuffer);
            }
            const remEntityPacker = new binaryWriter(
                6 + toRemove[0].length + toRemove[1].length + toRemove[2].length + toRemove[3].length * 2,
            );
            if (remEntityPacker.arrayBuffer.byteLength !== 6) {
                remEntityPacker.packInt8(constants.MSG_TYPES.REMOVE_ENTITY);
                remEntityPacker.packInt8(toRemove[0].length);
                remEntityPacker.packInt8(toRemove[1].length);
                remEntityPacker.packInt8(toRemove[2].length);
                remEntityPacker.packInt16(toRemove[3].length);
                for (let i = 0; i < toRemove[0].length; i++) remEntityPacker.packInt8(toRemove[0][i]);
                for (let i = 0; i < toRemove[1].length; i++) remEntityPacker.packInt8(toRemove[1][i]);
                for (let i = 0; i < toRemove[2].length; i++) remEntityPacker.packInt8(toRemove[2][i]);
                for (let i = 0; i < toRemove[3].length; i++) remEntityPacker.packInt16(toRemove[3][i]);
                socket.send(remEntityPacker.arrayBuffer);
            }
            socket.gameView = currView;
            let activeLeaves = this.qtree.retrieveLeaves([
                clientPlayer.position.x - 800,
                clientPlayer.position.y - 450,
                1600,
                900,
            ]);
            let entities = {
                Players: [],
            };
            for (let i = 0; i < activeLeaves.length; i++) {
                let node = activeLeaves[i];
                for (let i = 0, j = 0; j < node[2]; i++) {
                    let child = this.qtree.oldElts[node[1] + i];
                    if (child === undefined) continue;
                    else j++;
                    if (child[0] === constants.PLAYER.TYPE) {
                        if (this.Players[child[1]]) entities.Players.push(this.Players[child[1]]);
                    }
                }
            }
            if (entities.Players.length === 0) return;
            const binaryPacker = new binaryWriter(2 + entities.Players.length * 10 + 4);
            binaryPacker.packInt8(constants.MSG_TYPES.GAME_UPDATE);
            binaryPacker.packInt8(entities.Players.length);
            for (let i = 0; i < entities.Players.length; i++) {
                let player = entities.Players[i];
                binaryPacker.packInt8(player.id);
                binaryPacker.packInt16(player.position.x);
                binaryPacker.packInt16(player.position.y);
                binaryPacker.packInt8(player.velocity.x);
                binaryPacker.packInt8(player.velocity.y);
                binaryPacker.packInt8((player.rotation * 255) / Math.PI / 2);
                binaryPacker.packInt8(player.hand.use);
                binaryPacker.packInt8(player.hand.id);
            }
            binaryPacker.packInt32(this.frameStamp - epoch);
            clients[i].send(binaryPacker.arrayBuffer);
        }
    }
    sendLeaderboard() {
        const topTenPlayers = LeaderboardMethods.getTopTen(this.leaderboard, this);
        let clients = [...this.wss.clients];
        for (let i = 0; i < clients.length; i++) clients[i].send(topTenPlayers);
    }
}
