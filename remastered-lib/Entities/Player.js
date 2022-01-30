/*const mongoDB = global.mongoDB;
import { collapsauserbaseUser } from '../../api/models/index.js'*/
import fs from 'fs';
import { LeaderboardMethods, StorageMethods } from '../util/export.js';
import Entity from './Entity.js';
import constants from '../../shared/constants.js';
import { binaryWriter } from '../../shared/binary.js';
const items = JSON.parse(fs.readFileSync('./items.json', 'utf8'));
const getEpochDate = (date) => Date.now() - global.epoch - (date || 0);
/**
 * The class for players
 */
export default class Player extends Entity {
    constructor(usr, game, socketID) {
        super(
            {
                x: 30 + Math.floor(Math.random() * (500 - 30)),
                y: 30 + Math.floor(Math.random() * (500 - 30)),
            },
            100,
            game,
        );
        /**
         * @type {number} Radius of the player
         */
        this.radius = 30;
        /**
         * @type {{x:Number, y:Number}} Velocity of the player
         */
        this.velocity = {
            x: 0,
            y: 0,
        };
        /**
         * @type {Boolean} Whether or not the player is running
         */
        this.running = false;
        /**
         * @type {Number} The direction the player is facing
         */
        this.rotation = 0;
        /**
         * @typedef HandStorage
         * @property {Number} per
         * @property {Number} id
         * @property {Object} e I have no idea why this is an object
         * @property {Number} e.s Defines whether the left or right hand is attacking, probably scalable
         * @property {Number} use Defines whether the hand is being used
         * @property {Number} trying Defines whether or not the hand is using its ability
         * @property {{x:Number, y:Number}} position Defines the position of the hand
         * @property {Number} radius Defines the radius of the hand
         */
        /**
         * @type {HandStorage}
         */
        this.hand = {
            per: 0,
            id: 0,
            e: {
                s: 1,
            },
            slot: -1,
            use: false,
            trying: true,
            position: {
                x: Math.cos(this.rotation) * 38.4 + this.position.x,
                y: Math.sin(this.rotation) * 38.4 + this.position.y,
            },
            radius: 9,
        };
        this.readyToHit = true;
        this.move = {
            pressingAttack: false,
        };

        this.stamina = 20;
        this.maxStamina = 20;

        this.food = 20;
        this.maxFood = 20;

        this.is = constants.PLAYER.TYPE;
        this.socketID = socketID;
        this.usr = usr;
        this.score = 0;
        const Players = game.Players;
        for (let i = 0; i < constants.PLAYER.LIMIT; i++) {
            if (!Players[i]) {
                Players[i] = this;
                this.id = i;
                break;
            }
        }
        this.inventory = new ArrayBuffer(18);
        StorageMethods.addItem(this.inventory, new Uint8Array([1, 50]).buffer);
        StorageMethods.addItem(this.inventory, new Uint8Array([2, 50]).buffer);
        game.PlayerCount++;
        game.qtree.insert(this);
    }
    update(delta) {
        this.takeDamage(delta);
        const { id, position, velocity, rotation, hand, move } = this;
        let length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y); //calculating length
        if (length !== 0) {
            velocity.x = (velocity.x / length) * 100;
            velocity.y = (velocity.y / length) * 100;
        }
        position.x += velocity.x * delta;
        position.y += velocity.y * delta;
        if (position.x < 30) position.x = 30;
        if (position.y < 30) position.y = 30;
        this.hand.position = {
            x: Math.cos(this.rotation) * 38.4 + this.position.x,
            y: Math.sin(this.rotation) * 38.4 + this.position.y,
        };
        if (hand.use && hand.per === 0) {
            if (hand.id === 12) {
                let posPlace = [
                    Math.floor(
                        (Math.cos(this.rotation) * (this.mouseDis < 141 ? this.mouseDis : 142.42) + this.position.x) /
                            64,
                    ) * 64,
                    Math.floor(
                        (Math.sin(this.rotation) * (this.mouseDis < 141 ? this.mouseDis : 142.42) + this.position.y) /
                            64,
                    ) * 64,
                    64,
                    64,
                ];
                if (
                    this.game.qtree.retrieve(posPlace).length === 0 &&
                    posPlace[0] >= 0 &&
                    posPlace[0] <= constants.MAP.WIDTH - 64 &&
                    posPlace[1] >= 0 &&
                    posPlace[1] <= constants.MAP.HEIGHT - 64
                ) {
                    const wallUInt = new Uint8Array(this.game.Walls);
                    let wID;
                    for (let i = 0; i < 255; i++) {
                        if (wallUInt[((this.id << 8) + i) * 8] === 0) {
                            wID = i;
                            break;
                        }
                    }
                    let id = ((this.id << 8) + wID) * 8;
                    wallUInt[id] = 3;
                    wallUInt[id + 1] = (0xff00 && posPlace[0]) >> 8;
                    wallUInt[id + 2] = 0xff && posPlace[0];
                    wallUInt[id + 3] = (0xff00 && posPlace[1]) >> 8;
                    wallUInt[id + 4] = 0xff && posPlace[1];
                    wallUInt[id + 5] = this.id;
                    wallUInt[id + 6] = wID;
                    wallUInt[id + 7] = constants.MATERIAL.WOOD;
                    this.game.qtree.insert([3, (this.id << 8) + wID]);
                }
                hand.use = false;
            } else if (hand.id === 13) {
                hand.use = false;
            } else this.readyToHit = false;
        }
        if (hand.use) {
            switch (hand.id) {
                case 0:
                    hand.per += delta * 2;
                    if (hand.per - delta * 2 < 0.5 && hand.per >= 0.5) this.hit();
                    break;
                case 6:
                    hand.per += delta / 1.75;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 30,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 12 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 12, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                            }
                        }
                    }
                    break;
                case 7:
                    hand.per += delta / 2;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 25,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 6 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 6, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                                case constants.STONE.TYPE:
                                    this.score += 3;
                                    StorageMethods.addItem(this.inventory, new Uint8Array([2, 1]).buffer);
                                    break;
                            }
                        }
                    }
                    break;
                case 8:
                    hand.per += delta / 3;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 25,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 9 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 9, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                                case constants.TREE.TYPE:
                                    this.score += 8;
                                    StorageMethods.addItem(this.inventory, new Uint8Array([1, 8]).buffer);
                                    break;
                            }
                        }
                    }
                    break;
                case 9:
                    hand.per += delta / 1.75;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 30,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 18 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 18, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                            }
                        }
                    }
                    break;
                case 10:
                    hand.per += delta / 2;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 30,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 9 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 9, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                                case constants.STONE.TYPE:
                                    this.score += 6;
                                    StorageMethods.addItem(this.inventory, new Uint8Array([2, 2]).buffer);
                                    break;
                            }
                        }
                    }
                    break;
                case 11:
                    hand.per += delta / 3;
                    if (hand.per - delta / 3 < 0.5 && hand.per >= 0.5) {
                        let toHit = this.game.qtree.circleCircleCollisions({
                            position: {
                                x: Math.cos(this.rotation) * 60 + this.position.x,
                                y: Math.sin(this.rotation) * 60 + this.position.y,
                            },
                            radius: 25,
                        });
                        for (let i = 0; i < toHit.length; i++) {
                            const entity = toHit[i];
                            if (entity === this) continue;
                            switch (entity.is) {
                                case constants.PLAYER.TYPE:
                                    if (entity.health > 0 && entity.health - 12 < 0)
                                        this.score += Math.floor(entity.score / 3 + 2);
                                    let d = [0, 12, 2500, getEpochDate()];
                                    entity.receiveDamage(d);
                                    break;
                                case constants.TREE.TYPE:
                                    this.score += 10;
                                    StorageMethods.addItem(this.inventory, new Uint8Array([1, 10]).buffer);
                                    break;
                            }
                        }
                    }
                    break;
                case 12:
                    break;
                case 13:
                    break;
                default:
                    console.log(hand.id);
            }
        }
        if (hand.per >= 1) {
            if (!move.pressingAttack) {
                hand.use = false;
                this.readyToHit = true;
            }
            hand.per = 0;
            if (hand.id === 0) {
                if (hand.e.s == 1) hand.e.s == 0;
                else hand.e.s == 1;
            }
        }
    }
    takeDamage(delta) {
        if (!this.damages.length) this.health = this.clientHealth;
        const indexesToRemove = [];
        for (let i = 0; i < this.damages.length; i++) {
            const damageBitSet = this.damages[i];
            let type = damageBitSet[0],
                amount = damageBitSet[1],
                length = damageBitSet[2],
                start = damageBitSet[3];
            this.health -= (amount * delta * 1000) / length;
            if (getEpochDate(length + start) >= 0) {
                this.clientHealth -= amount;
                indexesToRemove.push(i);
            }
        }
        for (let i = indexesToRemove.length; i--; ) this.damages.splice(indexesToRemove[i], 1);
    }
    hit() {
        let toHit = this.game.qtree.circleCircleCollisions(this.hand);
        for (let i = 0; i < toHit.length; i++) {
            const entity = toHit[i];
            if (entity === this) continue;
            switch (entity.is) {
                case constants.PLAYER.TYPE:
                    if (entity.health > 0 && entity.health - 7 < 0) this.score += Math.floor(entity.score / 3 + 2);
                    let d = [0, 7, 250, getEpochDate()];
                    entity.receiveDamage(d);
                    break;

                case constants.TREE.TYPE:
                    this.score += 1;
                    StorageMethods.addItem(this.inventory, new Uint8Array([1, 1]).buffer);
                    break;
            }
        }
    }
    die() {
        let g = this.game;
        let GAME_OVER = new binaryWriter(1);
        GAME_OVER.packInt8(constants.MSG_TYPES.GAME_OVER);
        this.socket.send(GAME_OVER.arrayBuffer);
        LeaderboardMethods.removePlayer(g.leaderboard, this.id, g);
        g.Players[this.id] = undefined;
        g.PlayerCount--;
        g.qtree.remove(this); /*
        if (this.socket.userid) {
            let collapsauserbase = mongoDB.databases.get('collapsa').collections.get('collapsauserbase');
            let user = new collapsauserbaseUser(collapsauserbase.documents.get(this.socket.userid).data);
            if (user === undefined) return;
            if (user.highscore > this.score) return;
            user.highscore = this.score;
            collapsauserbase.updateDocument(user);
        }*/
    }
}
