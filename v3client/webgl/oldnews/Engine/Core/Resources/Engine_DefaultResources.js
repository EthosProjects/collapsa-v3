const webgl = GameEngine.Core.getGL();
const compileTextureShader = async (vertexShaderPath, fragmentShaderPath) => {
    let vertexShaderSource = await (await fetch(vertexShaderPath)).text();
    let fragmentShaderSource = await (await fetch(fragmentShaderPath)).text();
    let vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
    let fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(vertexShader, vertexShaderSource);
    webgl.shaderSource(fragmentShader, fragmentShaderSource);
    webgl.compileShader(vertexShader);
    webgl.compileShader(fragmentShader);
    let program = webgl.createProgram();
    webgl.attachShader(program, vertexShader);
    webgl.attachShader(program, fragmentShader);
    webgl.linkProgram(program);
    console.log(vertexShaderSource, fragmentShaderSource);
    if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) throw new Error('Error linking shader');
    console.log(webgl.getAttribLocation(program, 'a_squareVertexPosition'));
    console.log(webgl.getAttribLocation(program, 'a_textureCoordinate'));
};
compileTextureShader('/glsl/TextureVS.glsl', '/glsl/TextureFS.glsl');
/*
let shaderSource = GameEngine.ResourceMap.retrieveAsset(filePath);
let compiledShader = webgl.createShader(shaderType);
webgl.shaderSource(compiledShader, shaderSource);
webgl.compileShader(compiledShader);
// Check for errors and return results (null if error)
// The log info is how shader compilation errors are typically displayed.
// This is useful for debugging the shaders.
if (!webgl.getShaderParameter(compiledShader, webgl.COMPILE_STATUS)) {
    throw new Error('A shader compiling error occurred: ' + webgl.getShaderInfoLog(compiledShader));
} else return compiledShader;*/
class SimpleShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        const webgl = GameEngine.Core.getGL();
        // Step A: load and compile vertex and fragment shaders
        let vertexShader = this._compileShader(vertexShaderPath, webgl.VERTEX_SHADER);
        let fragmentShader = this._compileShader(fragmentShaderPath, webgl.FRAGMENT_SHADER);
        // Step B: Create and link the shaders into a program.
        /**
         * @type {WebGLProgram}
         */
        this._program = webgl.createProgram();
        webgl.attachShader(this._program, vertexShader);
        webgl.attachShader(this._program, fragmentShader);
        webgl.linkProgram(this._program);
        // Step C: check for error
        if (!webgl.getProgramParameter(this._program, webgl.LINK_STATUS)) throw new Error('Error linking shader');
        // Step D: Gets a reference to the aSquareVertexPosition attribute
        this._shaderVertexPositionAttribute = webgl.getAttribLocation(this._program, 'a_squareVertexPosition');
        // Step E: Activates the vertex buffer loaded in Engine.Core_VertexBuffer
        webgl.bindBuffer(webgl.ARRAY_BUFFER, GameEngine.VertexBuffer.getGLVertexRef());
        /// Step F: Describe the characteristic of the vertex position attribute
        webgl.vertexAttribPointer(
            this._shaderVertexPositionAttribute,
            3, // each element is a 3-float (x,y.z)
            webgl.FLOAT, // data type is FLOAT
            false, // if the content is normalized vectors
            0, // number of bytes to skip in between elements
            0,
        ); // offsets to the first element
        // Step G: Gets a reference to the uniform variable uPixelColor in the //     fragment shader
        /**
         * @type {WebGLUniformLocation}
         */
        this._pixelColor = webgl.getUniformLocation(this._program, 'u_pixelColor');
        /**
         * @type {WebGLUniformLocation}
         */
        this._modelTransform = webgl.getUniformLocation(this._program, 'u_modelTransform');
        /**
         * @type {WebGLUniformLocation}
         */
        this._viewProjTransform = webgl.getUniformLocation(this._program, 'u_viewProjTransform');
    }

    /**
     * Returns a complied shader from a shader in the dom.
     * @param {string} filePath
     * @param {string} shaderType
     * @returns
     */
    _compileShader(filePath, shaderType) {
        const webgl = GameEngine.Core.getGL();
        let shaderSource = GameEngine.Resources.retrieve(filePath);
        let compiledShader = webgl.createShader(shaderType);
        webgl.shaderSource(compiledShader, shaderSource);
        webgl.compileShader(compiledShader);
        // Check for errors and return results (null if error)
        // The log info is how shader compilation errors are typically displayed.
        // This is useful for debugging the shaders.
        if (!webgl.getShaderParameter(compiledShader, webgl.COMPILE_STATUS)) {
            throw new Error('A shader compiling error occurred: ' + webgl.getShaderInfoLog(compiledShader));
        } else return compiledShader;
    }
    activate(pixelColor, vpMatrix) {
        const webgl = GameEngine.Core.getGL();
        webgl.useProgram(this._program);
        webgl.enableVertexAttribArray(this._shaderVertexPositionAttribute);
        webgl.uniform4fv(this._pixelColor, pixelColor);
        webgl.uniformMatrix4fv(this._viewProjTransform, false, vpMatrix);
    }
    /**
     * Loads per-object model transform to the vertex shader
     * @param {mat4} modelTransform
     */
    loadObjectTransform(modelTransform) {
        const webgl = GameEngine.Core.getGL();
        webgl.uniformMatrix4fv(this._modelTransform, false, modelTransform);
    }
}
class TextureShader extends SimpleShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        super(vertexShaderPath, fragmentShaderPath);
        const webgl = GameEngine.Core.getGL();
        /**
         * reference to a_textureCoordinate within the shader
         * @type {number}
         */
        this._shaderTextureCoordAttribute = webgl.getAttribLocation(this._program, 'a_textureCoordinate');
    }
    // Overriding the Activation of the shader for rendering
    activate(pixelColor, vpMatrix) {
        // first call the super class’s activate
        SimpleShader.prototype.activate.call(this, pixelColor, vpMatrix);
        // now our own functionality: enable texture coordinate array
        const webgl = GameEngine.Core.getGL();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, GameEngine.VertexBuffer.textureCoordinateVertexBuffer);
        webgl.enableVertexAttribArray(this._shaderTextureCoordAttribute);
        webgl.vertexAttribPointer(this._shaderTextureCoordAttribute, 2, webgl.FLOAT, false, 0, 0);
    }
}
class SpriteShader extends TextureShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        super(vertexShaderPath, fragmentShaderPath);
        this.mTexCoordBuffer = null; // gl buffer containing texture coordinate
        var initTexCoord = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
        var gl = GameEngine.Core.getGL();
        this.mTexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(initTexCoord), gl.DYNAMIC_DRAW);
    }
}
SpriteShader.prototype.setTextureCoordinate = function (texCoord) {
    var gl = GameEngine.Core.getGL();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mTexCoordBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(texCoord));
};
SpriteShader.prototype.activate = function (pixelColor, vpMatrix) {
    // first call the super class’s activate
    SimpleShader.prototype.activate.call(this, pixelColor, vpMatrix);

    // now binds the proper texture coordinate buffer
    var gl = GameEngine.Core.getGL();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mTexCoordBuffer);
    gl.vertexAttribPointer(this._shaderTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this._shaderTextureCoordAttribute);
};

GameEngine.DefaultResources = (function () {
    // Simple Shader GLSL Shader file paths
    var kSimpleVS = '/glsl/SimpleVS.glsl'; // Path to the VertexShader
    var kSimpleFS = '/glsl/SimpleFS.glsl'; // Path to the simple FragmentShader
    var mConstColorShader = null; // variable for the SimpleShader object
    var _getConstColorShader = function () {
        return mConstColorShader;
    }; // assessor
    // Texture Shader
    var kTextureVS = '/glsl/TextureVS.glsl'; // Path to VertexShader
    var kTextureFS = '/glsl/TextureFS.glsl'; // Path to FragmentShader
    var mTextureShader = null;
    var getTextureShader = function () {
        return mTextureShader;
    };
    // Sprite Shader
    var mSpriteShader = null;
    var getSpriteShader = function () {
        return mSpriteShader;
    };

    // callback function after loadings are done
    var _createShaders = function (callBackFunction) {
        mConstColorShader = new SimpleShader(kSimpleVS, kSimpleFS);
        mTextureShader = new TextureShader(kTextureVS, kTextureFS);
        mSpriteShader = new SpriteShader(kTextureVS, kTextureFS);
        callBackFunction();
    };
    // initiate asynchronous loading of GLSL Shader files
    var _initialize = function (callBackFunction) {
        // constant color shader: SimpleVS, and SimpleFS
        GameEngine.TextFileLoader.load(kSimpleVS, GameEngine.TextFileLoader.eTextFileType.eTextFile);
        GameEngine.TextFileLoader.load(kSimpleFS, GameEngine.TextFileLoader.eTextFileType.eTextFile);
        // texture shader:
        GameEngine.TextFileLoader.load(kTextureVS, GameEngine.TextFileLoader.eTextFileType.eTextFile);
        GameEngine.TextFileLoader.load(kTextureFS, GameEngine.TextFileLoader.eTextFileType.eTextFile);
        GameEngine.Resources.setLoadCompleteCallback(function () {
            _createShaders(callBackFunction);
        });
    };
    var mPublic = {
        initialize: _initialize,
        getSolidShader: _getConstColorShader,
        getTextureShader: getTextureShader,
        getSpriteShader,
    };
    return mPublic;
})();
