import EntitySet from '../../RenderingEngine/util/EntitySet.js';
import Scene from '/js/RenderingEngine/Scene.js';
import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
import { Reader as BinaryReader, Writer as BinaryWriter } from '../v3binlingo.js';
import constants from '../constants.js';
import { Player, Tree } from '../Entities/exports.js';
window.playerID = null;
import { ws } from '../connect.js';
export default class GameplayScene extends Scene {
    constructor() {
        super();
        this._sceneFile = '/xml/scenes/gameplayScene.xml';
        this._imageAssets = [];
        /**
         * @type {[number, BinaryReader][]}
         */
        this._messages = [];
        this._entities = new EntitySet();
    }
    load() {
        RenderingEngine.Resources.Text.load(this._sceneFile, RenderingEngine.Resources.Text.FileType.XMLFile);
        for (let i = 0; i < this._imageAssets.length; i++) RenderingEngine.Resources.Texture.load(this._imageAssets[i]);
        document.querySelector('[rel=js-titleScreen]').style.display = 'none';
        RenderingEngine.Core.resizeCanvas();
        RenderingEngine.Core.canvas.style.display = 'block';
    }
    unload() {
        RenderingEngine.Resources.Text.unload(this._sceneFile); // Game loop not running, unload all assets
        for (let i = 0; i < this._imageAssets.length; i++)
            RenderingEngine.Resources.Texture.unload(this._imageAssets[i]);
        document.querySelector('[rel=js-titleScreen]').style.display = 'block';
        RenderingEngine.Core.canvas.style.display = 'none';
    }
    initialize() {
        let sceneParser = new SceneFileParser(this._sceneFile);
        this._camera = sceneParser.parseCamera();
        this._renderables = sceneParser.parseRenderables();
    }
    readMessages() {
        if (this._messages.length == 0) return;
        for (let i = 0; i < this._messages.length; i++) {
            const [messageType, messageReader] = this._messages[i];
            switch (messageType) {
                case constants.MSG_TYPES.ADD_ENTITY: {
                    const playerCount = messageReader.readUint8();
                    for (let i = 0; i < playerCount; i++) {
                        let player = new Player({
                            id: messageReader.readUint8(),
                            rotation: messageReader.readUint8(),
                            position: {
                                x: messageReader.readUint16(),
                                y: messageReader.readUint16(),
                            },
                            velocity: {
                                x: messageReader.readUint8(),
                                y: messageReader.readUint8(),
                            },
                            username: messageReader.readString(16),
                        });
                        this._entities.set((constants.PLAYER.TYPE << 8) + player.id, player);
                        if (!this.mainPlayer && this._entities.has((constants.PLAYER.TYPE << 8) + playerID)) {
                            const resolution = this._camera._width / 320;
                            this.mainPlayer = this._entities.get((constants.PLAYER.TYPE << 8) + playerID);
                            this._camera.setCenter(
                                this.mainPlayer.clientView.position.visualX * resolution,
                                this.mainPlayer.clientView.position.visualY * resolution,
                            );
                            this._camera.shake(100, 100, 15, 20);
                        }
                        //Players[player.id] = player;
                    }
                    const treeCount = messageReader.readUint8();
                    for (let i = 0; i < treeCount; i++) {
                        let tree = new Tree({
                            id: messageReader.readUint8(),
                            position: {
                                x: messageReader.readUint16(),
                                y: messageReader.readUint16(),
                            },
                        });
                        this._entities.set((constants.TREE.TYPE << 8) + tree.id, tree);
                    }
                    break;
                }
                case constants.MSG_TYPES.REMOVE_ENTITY: {
                    const playerCount = messageReader.readUint8();
                    for (let i = 0; i < playerCount; i++) {
                        this._entities.delete((constants.PLAYER.TYPE << 8) + messageReader.readUint8());
                    }
                    const treeCount = messageReader.readUint8();
                    for (let i = 0; i < treeCount; i++) {
                        this._entities.delete((constants.TREE.TYPE << 8) + messageReader.readUint8());
                    }
                    break;
                }
                case constants.MSG_TYPES.GAME_UPDATE: {
                    const playerCount = messageReader.readUint8();
                    for (let i = 0; i < playerCount; i++) {
                        const update = {
                            id: messageReader.readUint8(),
                            position: {
                                x: messageReader.readUint16(),
                                y: messageReader.readUint16(),
                            },
                            velocity: {
                                x: messageReader.readInt8(),
                                y: messageReader.readInt8(),
                            },
                        };
                        const player = this._entities.get((constants.PLAYER.TYPE << 8) + update.id);
                        player.pushUpdate(update);
                    }
                    break;
                }
                case constants.MSG_TYPES.PLAYER_VISUAL: {
                    const playerCount = messageReader.readUint8();
                    for (let i = 0; i < playerCount; i++) {
                        const update = {
                            id: messageReader.readUint8(),
                            rotation: messageReader.readUint8(),
                            hands: {
                                id: 0,
                                active: messageReader.readUint8(),
                            },
                        };
                        const player = this._entities.get((constants.PLAYER.TYPE << 8) + update.id);
                        player.animateUpdate(update);
                    }
                    break;
                }
                case constants.MSG_TYPES.PLAYER_ID: {
                    playerID = messageReader.readUint8();
                    this.mainPlayer = this._entities.get((constants.PLAYER.TYPE << 8) + playerID);
                    break;
                }
                case constants.MSG_TYPES.GAME_OVER: {
                    RenderingEngine.Loop.stop();
                }
                default: {
                    console.log(`Unknown message type: ${messageType}`);
                }
            }
        }
        this._messages.splice(0, this._messages.length);
    }
    update(delta) {
        const { gameMovement, hasChanged } = RenderingEngine.Input;
        this.readMessages();
        if (!this.mainPlayer) return;
        if (hasChanged()) {
            let bw = new BinaryWriter(9);
            bw.writeUint8(constants.MSG_TYPES.INPUT);
            bw.writeUint8(gameMovement[0]);
            bw.writeUint8(gameMovement[1]);
            bw.writeUint8(gameMovement[2]);
            bw.writeUint8(gameMovement[3]);
            bw.writeUint16(gameMovement[4]);
            bw.writeUint16(gameMovement[5]);
            ws.send(bw.arrayBuffer);
        }
        let angle = (gameMovement[2] * 360) / 255;
        this.mainPlayer._renderable._transform.setRotationInDegree(angle);
        if (gameMovement[0] & 1) this.mainPlayer.clientView.velocity.y = 10;
        if (gameMovement[0] & 4) this.mainPlayer.clientView.velocity.y = -10;
        if (gameMovement[0] & 8) this.mainPlayer.clientView.velocity.x = 10;
        if (gameMovement[0] & 2) this.mainPlayer.clientView.velocity.x = -10;

        this._entities.update(delta);
    }
    draw() {
        // If there isn't a player to center on, do nothing
        if (!this.mainPlayer) return;
        const resolution = this._camera._width / 320;
        this._camera.moveCenter(
            this.mainPlayer.clientView.position.visualX * resolution,
            this.mainPlayer.clientView.position.visualY * resolution,
        );
        this._camera.update();
        // Step A: clear the canvas
        RenderingEngine.Core.resizeCanvas(this._camera);
        RenderingEngine.Core.clearCanvas([0.95, 0.95, 0.95, 1.0]); // clear to light gray
        this._camera.setupViewProjection();
        for (let i = 0; i < this._renderables.length; i++) this._renderables[i].draw(this._camera);
        this._entities.draw(this._camera);
        // Step  B: Activate the drawing Camera
        window.opener++;
    }
}
