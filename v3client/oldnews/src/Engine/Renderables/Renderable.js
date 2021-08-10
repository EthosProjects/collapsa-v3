import Transform from '../Transform.js';
export default class Renderable {
    constructor() {
        this.mShader = gEngine.DefaultResources.getConstColorShader(); // the shader for shading this object
        this.mColor = [1, 1, 1, 1]; // Color for fragment shader
        this.mXform = new Transform(); // transform operator for the object
    }
    draw(vpMatrix) {
        var gl = gEngine.Core.getGL();
        this.mShader.activateShader(this.mColor, vpMatrix);
        this.mShader.loadObjectTransform(this.mXform.getXform());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    getColor() {
        return this.mColor;
    }
    setColor(color) {
        this.mColor = color;
    }
    get color() {
        return this.mColor;
    }
}
Renderable.prototype.getXform = function () {
    return this.mXform;
};
Renderable.prototype._setShader = function (s) {
    this.mShader = s;
};
