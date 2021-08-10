import SimpleShader from './SolidShader.js';
export default class TextureShader extends SimpleShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        super(vertexShaderPath, fragmentShaderPath);
        const webgl = RenderingEngine.Core.webgl;
        /**
         * reference to a_textureCoordinate within the shader
         * @type {number}
         */
        this._shaderTextureCoordAttribute = webgl.getAttribLocation(this._program, 'a_textureCoordinate');
        //console.log(this._shaderTextureCoordAttribute)
    }
    // Overriding the Activation of the shader for rendering
    activate(pixelColor, vpMatrix) {
        // first call the super class’s activate
        SimpleShader.prototype.activate.call(this, pixelColor, vpMatrix);
        // now our own functionality: enable texture coordinate array
        const webgl = RenderingEngine.Core.webgl;
        webgl.bindBuffer(webgl.ARRAY_BUFFER, RenderingEngine.VertexBuffer.textureCoordinateVertexBuffer);
        webgl.enableVertexAttribArray(this._shaderTextureCoordAttribute);
        webgl.vertexAttribPointer(this._shaderTextureCoordAttribute, 2, webgl.FLOAT, false, 0, 0);
    }
}
