const Text = {
    load: (fileName, fileType) => {
        return new Promise(async (resolve, reject) => {
            RenderingEngine.Resources.waitForLoad(fileName);
            if (RenderingEngine.Resources.isLoaded(fileName)) return;
            let text = await (await fetch(fileName)).text();
            let output = text;
            if (fileType === Text.FileType.XMLFile) {
                let parser = new DOMParser();
                output = parser.parseFromString(text, 'text/xml');
            }
            RenderingEngine.Resources.completeLoad(fileName, output);
            resolve();
        });
    },
    unload: (fileName) => RenderingEngine.Resources.unload(fileName),
    FileType: Object.freeze({
        XMLFile: 0,
        TextFile: 1,
    }),
};
export { Text };
