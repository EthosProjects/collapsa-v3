/**
 * @type {Object}
 */
window.RenderingEngine = window.RenderingEngine || {};
// instance variable: the graphical context for drawing
/**
 * The canvas element
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector('[rel=js-gameCanvas]');
/**
 * The rendering context
 * @type {WebGL2RenderingContext}
 */
const webgl = canvas.getContext('webgl2', { alpha: false });
if (webgl == null) throw new Error('WebGL2 is not supported.');
// Allows transperency with textures.
webgl.blendFunc(webgl.SRC_ALPHA, webgl.ONE_MINUS_SRC_ALPHA);
webgl.enable(webgl.BLEND);
// Set images to flip the y axis to match the texture coordinate space.
webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
/**
 * Begins a scene.
 * @param {Scene} scene
 */
const beginScene = (scene) => {
    scene.load(); // Called in this way to keep correct context
    RenderingEngine.Loop.start(scene); // start the game loop after initialization
};
/**
 *
 * @param {Scene} scene The opening scene
 */
const initialize = (scene) => {
    RenderingEngine.VertexBuffer.initialize();
    beginScene(scene);
};
// Contains the functions and variables that will be accessible.
RenderingEngine.Core = {
    webgl,
    canvas,
    initialize,
    resizeCanvas: (camera) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (camera) camera._viewport = [0, 0, canvas.width, canvas.height];
    },
    clearCanvas: (color) => {
        webgl.clearColor(color[0], color[1], color[2], color[3]); // set the color to    be cleared
        webgl.clear(webgl.COLOR_BUFFER_BIT); // clear to the color previously set
    },
    beginScene,
    cleanup: () => {
        RenderingEngine.VertexBuffer.cleanUp();
        RenderingEngine.Resources.globals.cleanUp();
    },
};
await import('./vertexBuffer.js');
RenderingEngine.VertexBuffer.initialize();
await import('./input.js');
await import('./loop.js');
await import('./resources/main.js');
export default null;
