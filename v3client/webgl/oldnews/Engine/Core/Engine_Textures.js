class TextureInfo {
    constructor(name, width, height, texture) {
        this._name = name;
        this._width = width;
        this._height = height;
        this.texture = texture;
    }
}
GameEngine.Texture = (function () {
    // Loads an texture so that it can be drawn.
    // If already in the map, will do nothing.
    var loadTexture = function (textureName) {
        if (!GameEngine.Resources.isAssetLoaded(textureName)) {
            // Create new Texture object.
            var img = new Image();

            // Update resources in loading counter.
            GameEngine.Resources.asyncLoadRequested(textureName);

            // When the texture loads, convert it to the WebGL format then put
            // it back into the mTextureMap.
            img.onload = function () {
                _processLoadedImage(textureName, img);
            };
            img.src = textureName;
        } else {
            //GameEngine.Resources.incAssetRefCount(textureName);
        }
    };
    // Remove the reference to allow associated memory
    // be available for subsequent garbage collection
    var unloadTexture = function (textureName) {
        var gl = GameEngine.Core.getGL();
        var texInfo = GameEngine.Resources.retrieve(textureName);
        gl.deleteTexture(texInfo.texture);
        GameEngine.Resources.unload(textureName);
    };
    var _processLoadedImage = function (textureName, image) {
        var gl = GameEngine.Core.getGL();

        // Creates a WebGL texture object
        var textureID = gl.createTexture();

        // bind texture with the current texture functionality in webGL
        gl.bindTexture(gl.TEXTURE_2D, textureID);

        // Load the texture into the texture data structure with descriptive info.
        // Parameters:
        //  1: Which "binding point" or target the texture is being loaded to.
        //  2: Level of detail. Used for mipmapping. 0 is base texture level.
        //  3: Internal format. The composition of each element, i.e. pixels.
        //  4: Format of texel data. Must match internal format.
        //  5: The data type of the texel data.
        //  6: Texture Data.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Creates a mipmap for this texture.
        gl.generateMipmap(gl.TEXTURE_2D);

        // Tells WebGL we are done manipulating data at the mGL.TEXTURE_2D target.
        gl.bindTexture(gl.TEXTURE_2D, null);

        var texInfo = new TextureInfo(textureName, image.naturalWidth, image.naturalHeight, textureID);
        GameEngine.Resources.asyncLoadCompleted(textureName, texInfo);
    };
    var activateTexture = function (textureName) {
        /**
         * @type {WebGLRenderingContext}
         */
        var gl = GameEngine.Core.getGL();
        var texInfo = GameEngine.Resources.retrieve(textureName);
        if (texInfo == null) throw new Error('Texture failed to load');
        // Binds our texture reference to the current webGL texture functionality
        gl.bindTexture(gl.TEXTURE_2D, texInfo.texture);

        // To prevent texture wrappings
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Handles how magnification and minimization filters will work.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        // For pixel-graphics where you want the texture to look "sharp" //     do the following:
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    };
    var deactivateTexture = function () {
        var gl = GameEngine.Core.getGL();
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    var getTextureInfo = function (textureName) {
        return GameEngine.Resources.retrieve(textureName);
    };
    // Public interface for this object. Anything not in here will
    // not be accessable.
    var mPublic = {
        load: loadTexture,
        unload: unloadTexture,
        activate: activateTexture,
        deactivate: deactivateTexture,
        getTextureInfo: getTextureInfo,
    };
    return mPublic;
})();
