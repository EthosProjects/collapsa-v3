import SpriteRenderable from './SpriteRenderable.js';
import Camera from '../Camera.js';
import Transform from '../Transform.js';
export default class FontRenderable2 {
    constructor(textContent) {
        this.font = RenderingEngine.Resources.globals.defaultFont;
        this.character = new SpriteRenderable(this.font + '.png');
        this._transform = new Transform();
        this.textContent = textContent;
    }
    draw(camera) {
        // center position of the first char
        let yPos = this._transform.getY();
        let xPos = this._transform.getX();
        const base = +RenderingEngine.Resources.retrieve(this.font).querySelector('common').getAttribute('base');
        const fontRatio = this._transform.scale[1] / base;
        for (let i = 0; i < this.textContent.length; i++) {
            const character = this.textContent.charCodeAt(i);
            const characterInfo = RenderingEngine.Resources.Font.getCharacterInfo(this.font, character);
            // set the texture coordinate
            this.character.setElementUVCoordinate(
                characterInfo._textureCoordinateLeft,
                characterInfo._textureCoordinateRight,
                characterInfo._textureCoordinateBottom,
                characterInfo._textureCoordinateTop,
            );
            const characterWidth = fontRatio * characterInfo._characterWidth;
            const characterHeight = fontRatio * characterInfo._characterHeight;
            const yOffset = fontRatio * characterInfo._characterHeightOffset * 0.5;
            const xOffset = fontRatio * characterInfo._characterWidthOffset * 0.5;
            const advance = fontRatio * characterInfo._advance;
            this.character._transform.scale[0] = characterWidth;
            this.character._transform.scale[1] = characterHeight;
            this.character._transform.position[0] = xPos - xOffset;
            this.character._transform.position[1] = yPos - yOffset;
            this.character.draw(camera);
            xPos += advance;
        }
    }
    setTextHeight(h) {
        this._transform.scale = new Float32Array([this.getWidth(h), h]);
    }
    getWidth(h) {
        let width = 0;
        const fontRatio = h / base;
        for (let i = 0; i < this.textContent.length; i++) {
            const character = this.textContent.charCodeAt(i);
            const characterInfo = RenderingEngine.Resources.Font.getCharacterInfo(this.font, character);
            const advance = fontRatio * characterInfo._advance;
            width += advance;
        }
        return width;
    }
}
