const vertexShaderSource = await (await fetch('/v3client/glsl/vertexShader.glsl')).text();
const fragmentShaderSource = await (await fetch('/v3client/glsl/fragmentShader.glsl')).text();
import constants from './constants.js';
import { Reader as BinaryReader, Writer as BinaryWriter } from './v3binlingo.js';
import Alert from '../Alert.js';
import { ws, connect } from './connect.js';
await connect();
const Zorque = new FontFace('Zorque', 'url(/img/Zorque.woff)', {});
const loadFont = new Promise((resolve) =>
    Zorque.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        resolve();
    }),
);
const assets = {};
const ASSET_NAMES = ['playerBody.png', 'playerHand.png'];
const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));
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
await Promise.all([downloadPromise, loadFont]);
new Alert('Loaded Fonts and images', 'success');

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector('[rel=js-gameCanvas]');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl2');
let setRectangle = (gl, [x, y, width, height], usage) => {
    let x1 = x,
        x2 = x + width,
        y1 = y,
        y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), usage);
};
const createShader = (type, source) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};
const createProgram = (vertexShader, fragmentShader) => {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};
let program = createProgram(
    createShader(gl.VERTEX_SHADER, vertexShaderSource),
    createShader(gl.FRAGMENT_SHADER, fragmentShaderSource),
);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
/**
 * @typedef Vector
 * @property {Number} x
 * @property {Number} y
 */
class Player {
    /**
     *
     * @param {Object} param0
     * @param {Vector} param0.position
     * @param {Vector} param0.velocity
     * @param {String} param0.username
     */
    constructor({ id, position, velocity, username }) {
        this.id = id;
        this.position = {
            x: position.x,
            y: position.y,
        };
        this.velocity = {
            x: velocity.x,
            y: velocity.y,
        };
        this.username = username;
        this.gl = {
            body: {
                vertexArray: gl.createVertexArray(),
                position: {
                    buffer: gl.createBuffer(),
                    attributeLocaton: gl.getAttribLocation(program, 'a_position'),
                },
                texcoord: {
                    buffer: gl.createBuffer(),
                    attributeLocaton: gl.getAttribLocation(program, 'a_texCoord'),
                },
                rotation: {
                    buffer: gl.createBuffer(),
                    attributeLocaton: gl.getAttribLocation(program, 'a_rotation'),
                },
            },
        };
        gl.bindVertexArray(this.gl.body.vertexArray);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl.body.position.buffer);
        setRectangle(gl, [this.position.x, this.position.y, 128, 128], gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(this.gl.body.position.attributeLocaton);
        gl.vertexAttribPointer(this.gl.body.position.attributeLocaton, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl.body.texcoord.buffer);
        setRectangle(gl, [0.0, 0.0, 1.0, 1.0], gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.gl.body.texcoord.attributeLocaton);
        gl.vertexAttribPointer(this.gl.body.texcoord.attributeLocaton, 2, gl.FLOAT, false, 0, 0);
        /*
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl.body.rotation.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            46 * Math.PI/180, 
            46 * Math.PI/180, 
            46 * Math.PI/180, 
            46 * Math.PI/180, 
            46 * Math.PI/180,
            46 * Math.PI/180
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.gl.body.rotation.attributeLocaton);
        gl.vertexAttribPointer(this.gl.body.rotation.attributeLocaton, 1, gl.FLOAT, false, 0, 0);*/
    }
    show() {
        gl.bindVertexArray(this.gl.body.vertexArray);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

let resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
let imageLocation = gl.getUniformLocation(program, 'u_image');

let texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Upload the image into the texture.
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets['playerBody.png']);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(1, 1, 1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.useProgram(program);
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
gl.uniform1i(imageLocation, 0);
/**
 * @type {[Number, BinaryReader][]}
 */
let messages = [];
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
        canvas.style.display = 'block';
        //window.requestAnimationFrame(gameLoop);
    } else messages.push([messageType, messageReader]);
};
import { startCapturingInput, stopCapturingInput, movement } from './input.js';
const startGame = (username) => {
    let bw = new BinaryWriter(17);
    bw.writeUint8(constants.MSG_TYPES.JOIN_GAME, false, 0);
    bw.writeString(username, 16);
    ws.send(bw.arrayBuffer);
    ws.addEventListener('message', receiveMessage);
    /**
     * @type {Player[]}
     */
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
    requestAnimationFrame(loop);
};
document.getElementById('enterGameForm').addEventListener('submit', function (e) {
    e.preventDefault();
    startGame(document.getElementById('enterGameUsernameInput').value || 'Collapsa.io');
});
export default null;
