import TextureShader from './TextureShader.js';
import SimpleShader from './SimpleShader.js';
export default class SpriteShader extends TextureShader {
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
SpriteShader.prototype.activateShader = function (pixelColor, vpMatrix) {
    // first call the super class’s activate
    SimpleShader.prototype.activateShader.call(this, pixelColor, vpMatrix);

    // now binds the proper texture coordinate buffer
    var gl = GameEngine.Core.getGL();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mTexCoordBuffer);
    gl.vertexAttribPointer(this.mShaderTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.mShaderTextureCoordAttribute);
};
