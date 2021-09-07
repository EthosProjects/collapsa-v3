/**
 * @typedef AssetInfo
 * @property {string} path
 * @property {number} references
 */
/**
 * @type {Set<string>}
 */
const oustandingLoads = new Set();
/**
 * @type {Map<string, AssetInfo>}
 */
const resources = new Map();
let loadResolve;
const waitForLoad = (path) => {
    if (resources.has(path)) resources.get(path).references++;
    else {
        oustandingLoads.add(path);
        if (!RenderingEngine.Resources.loadingAssets)
            RenderingEngine.Resources.loadPromise = new Promise((resolve) => {
                loadResolve = () => {
                    resolve();
                    RenderingEngine.Resources.loadingAssets = false;
                };
                RenderingEngine.Resources.loadingAssets = true;
            });
    }
};
const completeLoad = (path, data) => {
    if (RenderingEngine.Resources.loadingAssets === true && oustandingLoads.size == 1) loadResolve();
    oustandingLoads.delete(path);
    if (resources.has(path)) resources.get(path).references++;
    else resources.set(path, { path, references: 0, asset: data });
};
const isLoaded = (path) => resources.has(path);
const unload = (path) => resources.delete(path);
const retrieve = (path) => {
    let r = null;
    if (resources.has(path)) r = resources.get(path).asset;
    return r;
};
RenderingEngine.Resources = {
    waitForLoad,
    completeLoad,
    loadPromise: undefined,
    loadingAssets: false,
    isLoaded,
    unload,
    retrieve,
};
const { Text: TextResource } = await import('./text.js'),
    { Texture: TextureResource } = await import('./texture.js'),
    { Font: FontResource } = await import('./font.js');
RenderingEngine.Resources = {
    waitForLoad,
    completeLoad,
    loadPromise: undefined,
    loadingAssets: false,
    isLoaded,
    unload,
    retrieve,
    Text: TextResource,
    Texture: TextureResource,
    Font: FontResource,
};
RenderingEngine.Resources = {
    waitForLoad,
    completeLoad,
    loadPromise: undefined,
    loadingAssets: false,
    isLoaded,
    unload,
    retrieve,
    Text: TextResource,
    Texture: TextureResource,
    Font: FontResource,
    globals: (await import('./globals.js')).globals,
};
