import TextureRenderable from './TextureRenderable.js';
import Camera from '../Camera.js';
import SpriteShader from '../Shaders/SpriteShader.js';
export default class SpriteRenderable extends TextureRenderable {
    constructor(texture) {
        super(texture);
        /**
         * @type {SpriteShader}
         */
        this._shader = RenderingEngine.Resources.globals.spriteShader;
        this._textureLeft = 0.0; // bounds of texture coord (0 is left, 1 is right)
        this._textureRight = 1.0;
        this._textureTop = 1.0; // 1 is top and 0 is bottom of image
        this._textureBottom = 0.0;
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera) {
        this._shader.setTextureCoordinate(this.getElementUVCoordinateArray());
        TextureRenderable.prototype.draw.call(this, camera);
    }
    setElementUVCoordinate(left, right, bottom, top) {
        this._textureLeft = left;
        this._textureRight = right;
        this._textureBottom = bottom;
        this._textureTop = top;
    }
    setElementPixelPositions(left, right, bottom, top) {
        console.log(this._texture);
        console.trace();
        const textureInfo = RenderingEngine.Resources.retrieve(this._texture);
        // entire image width, height
        const imageW = textureInfo._width;
        const imageH = textureInfo._height;

        this._textureLeft = left / imageW;
        this._textureRight = right / imageW;
        this._textureBottom = bottom / imageH;
        this._textureTop = top / imageH;
    }
    getElementUVCoordinateArray() {
        return [
            this._textureRight,
            this._textureTop, // x,y of top-right
            this._textureLeft,
            this._textureTop, // x,y of top-left
            this._textureRight,
            this._textureBottom, // x,y of bottom-right
            this._textureLeft,
            this._textureBottom, // x, y of bottom-left
        ];
    }
}
SpriteRenderable._textureCoordinateArray = Object.freeze({
    _left: 2,
    _right: 0,
    _top: 1,
    _bottom: 5,
});
// the expected texture cooridnate array is an array of 8 floats where:
//  [0] [1]: is u/v cooridnate of Top-Right
//  [2] [3]: is u/v coordinate of Top-Left
//  [4] [5]: is u/v coordinate of Bottom-Right
//  [6] [7]: is u/v coordinate of Bottom-Left
