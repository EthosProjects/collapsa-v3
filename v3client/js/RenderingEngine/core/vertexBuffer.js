/**
 * @type {Object}
 */
window.RenderingEngine = window.RenderingEngine || {};
/**
 * reference to the vertex positions for the square in the webgl context
 * @type {WebGLBuffer}
 */
let renderableVertexBuffer = null;
/**
 * reference to the texture positions for the square vertices in the webgl context
 * @type {WebGLBuffer}
 */
let textureCoordinateVertexBuffer = null;
// First: define the vertices for a square
let verticesOfSquare = [0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 0.0];
// Second: define the corresponding texture cooridnates
let textureCoordinates = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
const initialize = () => {
    let webgl = RenderingEngine.Core.webgl;
    // Step A: Allocate and store vertex positions into the webGL context
    // Create a buffer, activate it, and then load it with data
    RenderingEngine.VertexBuffer.renderableVertexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, RenderingEngine.VertexBuffer.renderableVertexBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(verticesOfSquare), webgl.STATIC_DRAW);
    // Step  B: Allocate and store texture coordinates
    // Create a buffer, activate it, and then load it with data
    RenderingEngine.VertexBuffer.textureCoordinateVertexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, RenderingEngine.VertexBuffer.textureCoordinateVertexBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(textureCoordinates), webgl.STATIC_DRAW);
};
const cleanup = () => {
    const webgl = RenderingEngine.Core.webgl;
    webgl.deleteBuffer(RenderingEngine.VertexBuffer.renderableVertexBuffer);
    webgl.deleteBuffer(RenderingEngine.VertexBuffer.textureCoordinateVertexBuffer);
};
RenderingEngine.VertexBuffer = {
    initialize,
    renderableVertexBuffer: null,
    textureCoordinateVertexBuffer: null,
    cleanup,
};
