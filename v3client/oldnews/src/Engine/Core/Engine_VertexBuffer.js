'use strict'; // Operate in Strict mode

window.gEngine = window.gEngine || {};
// The VertexBuffer object
gEngine.VertexBuffer = (function () {
    // reference to the vertex positions for the square in the gl context
    var mSquareVertexBuffer = null;

    // reference to the texture positions for the square vertices in the gl context
    var mTextureCoordBuffer = null;

    // First: define the vertices for a square
    var verticesOfSquare = [0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 0.0];

    // Second: define the corresponding texture cooridnates
    var textureCoordinates = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];

    var getGLVertexRef = function () {
        return mSquareVertexBuffer;
    };

    var initialize = function () {
        var gl = gEngine.Core.getGL();
        // Step A: Allocate and store vertex positions into the webGL context
        // Create a buffer on the gGL context for our vertex positions
        mSquareVertexBuffer = gl.createBuffer();
        // Activate vertexBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mSquareVertexBuffer);
        // Loads verticesOfSquare into the vertexBuffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesOfSquare), gl.STATIC_DRAW);
        // Step  B: Allocate and store texture coordinates
        // Create a buffer on the gGL context for our vertex positions
        mTextureCoordBuffer = gl.createBuffer();
        // Activate vertexBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mTextureCoordBuffer);
        // Loads verticesOfSquare into the vertexBuffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    };
    var getGLTexCoordRef = function () {
        return mTextureCoordBuffer;
    };
    var mPublic = {
        initialize: initialize,
        getGLVertexRef: getGLVertexRef,
        getGLTexCoordRef,
    };
    return mPublic;
})();
