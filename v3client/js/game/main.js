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
startGame(document.getElementById('enterGameUsernameInput').value || 'Collapsa.io');
