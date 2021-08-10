import SimpleShader from './SimpleShader.js';
export default class TextureShader extends SimpleShader {
    constructor(vertexShaderPath, fragmentShaderPath) {
        super(vertexShaderPath, fragmentShaderPath);
        // reference to aTextureCoordinate within the shader
        this.mShaderTextureCoordAttribute = null;

        // get the reference of aTextureCoordinate from the shader
        var gl = GameEngine.Core.getGL();
        this.mShaderTextureCoordAttribute = gl.getAttribLocation(this.mCompiledShader, 'aTextureCoordinate');
    }
}
// Overriding the Activation of the shader for rendering
TextureShader.prototype.activateShader = function (pixelColor, vpMatrix) {
    // first call the super class’s activate
    SimpleShader.prototype.activateShader.call(this, pixelColor, vpMatrix);

    // now our own functionality: enable texture coordinate array
    var gl = GameEngine.Core.getGL();
    gl.bindBuffer(gl.ARRAY_BUFFER, GameEngine.VertexBuffer.getGLTexCoordRef());
    gl.enableVertexAttribArray(this.mShaderTextureCoordAttribute);
    gl.vertexAttribPointer(this.mShaderTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
};
