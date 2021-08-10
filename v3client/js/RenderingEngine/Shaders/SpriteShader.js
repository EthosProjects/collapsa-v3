import TextureShader from './TextureShader.js';
import SolidShader from './SolidShader.js';
export default class SpriteShader extends TextureShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        super(vertexShaderPath, fragmentShaderPath);
        const webgl = RenderingEngine.Core.webgl;
        const initTexCoord = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
        /**
         * @type {WebGLBuffer}
         */
        this._textureCoordinateBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this._textureCoordinateBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(initTexCoord), webgl.DYNAMIC_DRAW);
    }
    setTextureCoordinate(textureCoordinate) {
        const webgl = RenderingEngine.Core.webgl;
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this._textureCoordinateBuffer);
        webgl.bufferSubData(webgl.ARRAY_BUFFER, 0, new Float32Array(textureCoordinate));
    }
    activate(pixelColor, vpMatrix) {
        // first call the super class’s activate
        SolidShader.prototype.activate.call(this, pixelColor, vpMatrix);
        // now binds the proper texture coordinate buffer
        const webgl = RenderingEngine.Core.webgl;
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this._textureCoordinateBuffer);
        webgl.vertexAttribPointer(this._shaderTextureCoordAttribute, 2, webgl.FLOAT, false, 0, 0);
        webgl.enableVertexAttribArray(this._shaderTextureCoordAttribute);
    }
}
