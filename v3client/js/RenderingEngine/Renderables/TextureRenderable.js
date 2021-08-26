import BaseRenderable from './BaseRenderable.js';
import Camera from '../Camera.js';
// Constructor and object definition
export default class TextureRenderable extends BaseRenderable {
    constructor(texture) {
        super();
        this.color = [1, 1, 1, 0];
        this._shader = RenderingEngine.Resources.globals.textureShader;
        this._texture = texture; // the object’s texture, cannot be null.
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera, matrix) {
        RenderingEngine.Resources.Texture.activate(this._texture);
        BaseRenderable.prototype.draw.call(this, camera, matrix);
    }
}
