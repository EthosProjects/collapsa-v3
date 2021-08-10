class TextureInfo {
    constructor(name, width, height, texture) {
        this._name = name;
        this._width = width;
        this._height = height;
        this.texture = texture;
    }
}
const _index = (path, image) => {
    const webgl = RenderingEngine.Core.webgl;
    // Creates a WebGL texture object
    const texture = webgl.createTexture();
    // bind texture with the current texture functionality in webGL
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    // Load the texture into the texture data structure with descriptive info
    webgl.texImage2D(
        webgl.TEXTURE_2D, // Which "binding point" or target the texture is being loaded to
        0, //Level of detail. Used for mipmapping. 0 is base texture level
        webgl.RGBA, // Internal format. The composition of each element, i.e. pixels
        webgl.RGBA, // Format of texel data. Must match internal format
        webgl.UNSIGNED_BYTE, // The data type of the texel data
        image, // Texture Data
    );
    // Creates a mipmap for this texture.
    webgl.generateMipmap(webgl.TEXTURE_2D);
    // Tells WebGL we are done manipulating data at the mGL.TEXTURE_2D target.
    webgl.bindTexture(webgl.TEXTURE_2D, null);
    const textureInfo = new TextureInfo(path, image.naturalWidth, image.naturalHeight, texture);
    RenderingEngine.Resources.completeLoad(path, textureInfo);
};
const Texture = {
    // Loads an texture so that it can be drawn.
    // If already in the map, will do nothing.
    load: (path) => {
        RenderingEngine.Resources.waitForLoad(path);
        if (RenderingEngine.Resources.isLoaded(path)) return;
        let image = new Image();
        image.src = path;
        image.onload = () => _index(path, image);
    },
    // Remove the reference to allow associated memory
    // be available for subsequent garbage collection
    unload: (path) => {
        const webgl = RenderingEngine.Core.webgl;
        const textureInfo = RenderingEngine.Resources.retrieve(path);
        webgl.deleteTexture(textureInfo.texture);
        RenderingEngine.Resources.unload(path);
    },
    activate: (path) => {
        const webgl = RenderingEngine.Core.webgl;
        const textureInfo = RenderingEngine.Resources.retrieve(path);
        if (textureInfo === null) throw new Error('Texture not loaded');
        // Binds our texture reference to the current webGL texture functionality
        webgl.bindTexture(webgl.TEXTURE_2D, textureInfo.texture);
        // To prevent texture wrappings
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);

        // Handles how magnification and minimization filters will work.
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR_MIPMAP_LINEAR);
        // For pixel-graphics where you want the texture to look "sharp" //     do the following:
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    },
    deactivate: () => {
        const webgl = RenderingEngine.Core.webgl;
        webgl.bindTexture(webgl.TEXTURE_2D, null);
    },
};
export { Texture };
