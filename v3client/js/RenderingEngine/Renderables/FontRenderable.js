import SpriteRenderable from './SpriteRenderable.js';
import Camera from '../Camera.js';
import Transform from '../Transform.js';
export default class FontRenderable {
    constructor(textContent) {
        this.font = RenderingEngine.Resources.globals.defaultFont;
        this.character = new SpriteRenderable(this.font + '.png');
        this._transform = new Transform();
        this.textContent = textContent;
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera) {
        // we will draw the text string by calling to mOneChar for each of the
        // chars in the mText string.
        const widthOfOneCharacter = this._transform.getWidth() / this.textContent.length;
        const heightOfOneCharacter = this._transform.getHeight();
        // this.mOneChar.getXform().SetRotationInRad(this.mXform.getRotationInRad());
        let yPos = this._transform.getY();
        // center position of the first char
        let xPos = this._transform.getX();
        for (let i = 0; i < this.textContent.length; i++) {
            let character = this.textContent.charCodeAt(i);
            let characterInfo = RenderingEngine.Resources.Font.getCharacterInfo(this.font, character);
            // set the texture coordinate
            this.character.setElementUVCoordinate(
                characterInfo._textureCoordinateLeft,
                characterInfo._textureCoordinateRight,
                characterInfo._textureCoordinateBottom,
                characterInfo._textureCoordinateTop,
            );
            // now the size of the char
            const xSize = widthOfOneCharacter * characterInfo._characterWidthOffset;
            const ySize = heightOfOneCharacter * characterInfo._characterHeightOffset;
            this.character._transform.scale[0] = xSize;
            this.character._transform.scale[1] = ySize;
            // how much to offset from the center
            const xOffset = widthOfOneCharacter * characterInfo._characterWidthOffset * 0.5;
            const yOffset = heightOfOneCharacter * characterInfo._characterHeightOffset * 0.5;
            this.character._transform.position[0] = xPos - xOffset;
            this.character._transform.position[1] = yPos - yOffset;
            this.character.draw(camera);
            xPos += widthOfOneCharacter;
        }
    }
}
//**-----------------------------------------
// Public methods
//**-----------------------------------------
FontRenderable.prototype.setText = function (t) {
    this.mText = t;
    this.setTextHeight(this._transform.getHeight());
};
FontRenderable.prototype.setTextHeight = function (h) {
    const characterInfo = RenderingEngine.Resources.Font.getCharacterInfo(this.font, 'A'.charCodeAt(0)); // this is for "A"
    const w = h * characterInfo._characterAspectRatio;
    this._transform.scale = new Float32Array([w * this.textContent.length, h]);
};
FontRenderable.prototype.getFont = function () {
    return this.mFont;
};
FontRenderable.prototype.setFont = function (f) {
    this.mFont = f;
    this.mOneChar.setTexture(this.mFont + '.png');
};

FontRenderable.prototype.setColor = function (c) {
    this.character.color = c;
};
FontRenderable.prototype.getColor = function () {
    return this.character.color;
};

FontRenderable.prototype.update = function () {};

FontRenderable.prototype.getStringWidth = function (h) {
    let stringWidth = 0;
    let charSize = h;
    for (let i = 0; i < this.textContent; i++) {
        let character = this.textContent.charCodeAt(i);
        let characterInfo = RenderingEngine.Resources.Font.getCharacterInfo(this.font, character);
        stringWidth += charSize * characterInfo._characterWidth * characterInfo._xAdvance;
    }
    return stringWidth;
};

//--- end of Public Methods
//</editor-fold>
