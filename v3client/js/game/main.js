import '../RenderingEngine/core/main.js';
const vertexShaderSource = await (await fetch('/v3client/glsl/vertexShader.glsl')).text();
const fragmentShaderSource = await (await fetch('/v3client/glsl/fragmentShader.glsl')).text();
import constants from './constants.js';
import { Reader as BinaryReader, Writer as BinaryWriter } from './v3binlingo.js';
import Alert from '../Alert.js';
import { ws, connect } from './connect.js';
import GameplayScene from './Scenes/GameplayScene.js';
await connect();
const assets = {};
const ASSET_NAMES = ['/img/playerBody.png', '/img/playerHand.png'];
//const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));
function downloadAsset(assetName) {
    return new Promise((resolve) => {
        const asset = new Image();
        asset.onload = () => {
            assets[assetName] = asset;
            resolve();
        };
        asset.src = `/img/${assetName}`;
    });
}
await Promise.all([
    ASSET_NAMES.map((p) => RenderingEngine.Resources.Texture.load(p)),
    RenderingEngine.Resources.Font.load('/img/Zorque.woff', 'Zorque'),
]);
new Alert('Loaded Fonts and images', 'success');
const gameplayScene = new GameplayScene();
/**
 *
 * @param {MessageEvent} e
 */
let receiveMessage = async (e) => {
    let messageReader = new BinaryReader(await e.data.arrayBuffer());
    let messageType = messageReader.readUint8();
    if (messageType === constants.MSG_TYPES.GAME_LOADING) {
        //Closes the start screen and opens the canvas
        document.querySelector('[rel=js-titleScreen]').style.display = 'none';
        RenderingEngine.Core.resizeCanvas();
        RenderingEngine.Core.canvas.style.display = 'block';
        RenderingEngine.Core.initialize(gameplayScene);
        //window.requestAnimationFrame(gameLoop);
    } else gameplayScene._messages.push([messageType, messageReader]);
};
const startGame = (username) => {
    let bw = new BinaryWriter(17);
    bw.writeUint8(constants.MSG_TYPES.JOIN_GAME, false, 0);
    bw.writeString(username, 16);
    ws.send(bw.arrayBuffer);
    ws.addEventListener('message', receiveMessage);
    RenderingEngine.Input.startCapturing();
};
document.getElementById('enterGameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    startGame(document.getElementById('enterGameUsernameInput').value || 'Collapsa.io');
});
startGame(
    document.getElementById('enterGameUsernameInput').value || 'Collapsa.io',
); /*
    let Players = new Array(constants.PLAYER.LIMIT);
    let playerID = false;
    startCapturingInput();
    let handleMessages = () => {
        if (messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            let [messageType, messageReader] = messages[i];
            console.log(messageType);
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
                        Players[player.id] = player;
                    }
                    break;
                }
                case constants.MSG_TYPES.PLAYER_ID: {
                    playerID = messageReader.readUint8();
                    console.log(playerID);
                    break;
                }
                default: {
                    console.log(`Unknown message type: ${messageType}`);
                }
            }
        }
        messages = [];
    };
    let updateFrame = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        if (checkForInput()) {
            let bw = new BinaryWriter(9);
            /*bw.writeUint8(constants.MSG_TYPES.INPUT);
            bw.writeUint8(movement[0]);
            bw.writeUint8(movement[1]);
            bw.writeUint8(movement[2]);
            bw.writeUint8(movement[3]);
            bw.writeUint16(movement[4]);
            bw.writeUint16(movement[5]);
            ws.send(bw.arrayBuffer);*/ /*
            let key = movement[0];
            let angle = (movement[2] * 360) / 255;
            Players[playerID].rotation = angle;
        }
        //console.log(movement)
        //gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        //setRectangles(gl, [[30, 0, 550, 550]], gl.STATIC_DRAW);
    };
    let drawFrame = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (let i = 0; i < Players.length; i++) {
            if (Players[i] == undefined) continue;
            Players[i].show();
        }
    };
    let previousTick = Date.now();
    const loop = () => {
        let now = Date.now();
        let delta = now - previousTick;
        previousTick = now;
        handleMessages();
        updateFrame();
        drawFrame();
        requestAnimationFrame(loop);
        //console.log('delta', delta, '(target: ' + TICK_LENGTH_MS +' ms)', 'node ticks', ticks)
    };
    const preLoop = () => {
        handleMessages();
        if (playerID == undefined || Players[playerID] == undefined) requestAnimationFrame(preLoop);
        else requestAnimationFrame(loop);
    };
    requestAnimationFrame(preLoop);
};
*/
/*
import { startCapturingInput, stopCapturingInput, movement, checkForInput } from './input.js';
const startGame = (username) => {
    let bw = new BinaryWriter(17);
    bw.writeUint8(constants.MSG_TYPES.JOIN_GAME, false, 0);
    bw.writeString(username, 16);
    ws.send(bw.arrayBuffer);
    ws.addEventListener('message', receiveMessage);
    /**
     * @type {Player[]}
     */
