import EntitySet from '../../RenderingEngine/util/EntitySet.js';
import Scene from '/js/RenderingEngine/Scene.js';
import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
import { Reader as BinaryReader, Writer as BinaryWriter } from '../v3binlingo.js';
import constants from '../constants.js';
import { Player } from '../Entities/exports.js';
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
    }
    unload() {
        RenderingEngine.Resources.Text.unload(this._sceneFile); // Game loop not running, unload all assets
        for (let i = 0; i < this._imageAssets.length; i++)
            RenderingEngine.Resources.Texture.unload(this._imageAssets[i]);
    }
    initialize() {
        let sceneParser = new SceneFileParser(this._sceneFile);
        this._camera = sceneParser.parseCamera();
        this._renderables = sceneParser.parseRenderables();
        for (let i = 0; i < this._renderables.length; i++) {
            this._entities.set(i * 50, this._renderables[i]);
        }
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
                        this.mainPlayer = this._entities.get((constants.PLAYER.TYPE << 8) + playerID);
                        //Players[player.id] = player;
                    }
                    break;
                }
                case constants.MSG_TYPES.PLAYER_ID: {
                    playerID = messageReader.readUint8();
                    this.mainPlayer = this._entities.get((constants.PLAYER.TYPE << 8) + playerID);
                    break;
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
            let key = gameMovement[0];
            let angle = (gameMovement[2] * 360) / 255;
            this.mainPlayer._renderable._transform.setRotationInDegree(angle);
        }
        if (gameMovement[0] & 1) this.mainPlayer._position.y += 10 * delta;
        if (gameMovement[0] & 4) this.mainPlayer._position.y -= 10 * delta;
        if (gameMovement[0] & 8) this.mainPlayer._position.x += 10 * delta;
        if (gameMovement[0] & 2) this.mainPlayer._position.x -= 10 * delta;
        this._entities.update(delta);
    }
    draw() {
        if (!this.mainPlayer) return;
        this._camera._center = new Float32Array(this.mainPlayer._renderable._transform.position);
        // Step A: clear the canvas
        RenderingEngine.Core.resizeCanvas(this._camera);
        RenderingEngine.Core.clearCanvas([0.95, 0.95, 0.95, 1.0]); // clear to light gray
        this._camera.setupViewProjection();
        this._entities.draw(this._camera);
        // Step  B: Activate the drawing Camera
        window.opener++;
    }
}
