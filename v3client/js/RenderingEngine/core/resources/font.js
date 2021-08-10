const Font = {
    load: (path, name) => {
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
    unload: (path) => RenderingEngine.Resources.unload(path),
    FileType: Object.freeze({
        XMLFile: 0,
        TextFile: 1,
    }),
};
export { Font };
