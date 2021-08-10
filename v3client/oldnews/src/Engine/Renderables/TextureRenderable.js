import Renderable from './Renderable.js';
// Constructor and object definition
export default class TextureRenderable extends Renderable {
    constructor(myTexture) {
        super();
        Renderable.prototype.setColor.call(this, [1, 1, 1, 0]); // Alpha 0: switch off tinting
        Renderable.prototype._setShader.call(this, gEngine.DefaultResources.getTextureShader());
        this.mTexture = myTexture; // the object’s texture, cannot be null.
    }
}
TextureRenderable.prototype.draw = function (vpMatrix) {
    // activate the texture
    gEngine.Textures.activateTexture(this.mTexture);
    Renderable.prototype.draw.call(this, vpMatrix);
};
TextureRenderable.prototype.getTexture = function () {
    return this.mTexture;
};
TextureRenderable.prototype.setTexture = function (t) {
    this.mTexture = t;
};
