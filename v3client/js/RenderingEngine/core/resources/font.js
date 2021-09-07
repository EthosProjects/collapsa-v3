// for convenenit communication of per-character information
// all size returned are in normalize unit (range between 0 to 1)
class CharacterInfo {
    constructor() {
        // in texture coordinate (0 to 1) maps to the entire image
        this._textureCoordinateLeft = 0;
        this._textureCoordinateRight = 1;
        this._textureCoordinateBottom = 0;
        this._textureCoordinateTop = 0;

        // reference to nominal character size, 1 is "standard width/height" of a char
        this._characterWidth = 1;
        this._characterHeight = 1;
        this._characterWidthOffset = 0;
        this._characterHeightOffset = 0;

        // reference of char width/height ratio
        this._characterAspectRatio = 1;

        // reference to advance
        this._advance = 0;
    }
}
const _storeLoadedFont = (fontName) => {
    const fontInfo = RenderingEngine.Resources.retrieve(fontName + '.fnt');
    fontInfo.FontImage = fontName + '.png';
    RenderingEngine.Resources.completeLoad(fontName, fontInfo);
};
const Font = {
    load: (fontName) => {
        if (RenderingEngine.Resources.isLoaded(fontName)) return RenderingEngine.Resources.completeLoad(fontName);
        const fontInfoSourceString = fontName + '.fnt';
        const textureSourceString = fontName + '.png';
        RenderingEngine.Resources.waitForLoad(fontName);
        Promise.all([
            RenderingEngine.Resources.Texture.load(textureSourceString),
            RenderingEngine.Resources.Text.load(fontInfoSourceString, RenderingEngine.Resources.Text.FileType.XMLFile),
        ]).then(() => _storeLoadedFont(fontName));
    },
    // Remove the reference to allow associated memory
    // be available for subsequent garbage collection
    unload: (fontName) => {
        RenderingEngine.Resources.unload(fontName);
        if (RenderingEngine.Resources.isLoaded(fontName)) return;
        const fontInfoSourceString = fontName + '.fnt';
        const textureSourceString = fontName + '.png';
        RenderingEngine.Resources.Texture.unload(textureSourceString);
        RenderingEngine.Resources.Text.unload(fontInfoSourceString);
    },
    getCharacterInfo: (fontName, characterName) => {
        /**
         * @type {Document}
         */
        const fontInfo = RenderingEngine.Resources.retrieve(fontName);
        const commonPath = 'font/common';
        const commonInfo = fontInfo.evaluate(commonPath, fontInfo, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (commonInfo === null) return null;
        const characterHeight = commonInfo.getAttribute('base');
        const characterPath = 'font/chars/char[@id=' + characterName + ']';
        const characterInfo = fontInfo
            .evaluate(characterPath, fontInfo, null, XPathResult.ANY_TYPE, null)
            .iterateNext();
        if (characterInfo === null) return null;
        const returnInfo = new CharacterInfo();
        const textureInfo = RenderingEngine.Resources.retrieve(fontInfo.FontImage);
        const leftPixel = Number(characterInfo.getAttribute('x'));
        const rightPixel = leftPixel + Number(characterInfo.getAttribute('width')) - 1;
        const topPixel = textureInfo._height - 1 - Number(characterInfo.getAttribute('y'));
        const bottomPixel = topPixel - Number(characterInfo.getAttribute('height')) + 1;

        // texture coordinate information
        returnInfo._textureCoordinateLeft = leftPixel / (textureInfo._width - 1);
        returnInfo._textureCoordinateTop = topPixel / (textureInfo._height - 1);
        returnInfo._textureCoordinateRight = rightPixel / (textureInfo._width - 1);
        returnInfo._textureCoordinateBottom = bottomPixel / (textureInfo._height - 1);

        // relative character size
        returnInfo._characterWidth = +characterInfo.getAttribute('width');
        returnInfo._characterHeight = +characterInfo.getAttribute('height');
        returnInfo._characterWidthOffset = +characterInfo.getAttribute('xoffset');
        returnInfo._characterHeightOffset = +characterInfo.getAttribute('yoffset');
        returnInfo._characterAspectRatio = returnInfo._characterWidth / returnInfo._characterHeight;
        // advance
        returnInfo._advance = +characterInfo.getAttribute('xadvance');
        return returnInfo;
    },
    loadHTML: (path, name) => {
        return new Promise(async (resolve, reject) => {
            RenderingEngine.Resources.waitForLoad(path);
            if (RenderingEngine.Resources.isLoaded(path)) return;
            const font = new FontFace(name, `url(${path})`, {});
            await font.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
            }, console.log);
            RenderingEngine.Resources.completeLoad(path, font);
            resolve();
        });
    },
    FileType: Object.freeze({
        XMLFile: 0,
        TextFile: 1,
    }),
};
export { Font };
