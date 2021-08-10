GameEngine.TextFileLoader = (function () {
    var eTextFileType = Object.freeze({
        eXMLFile: 0,
        eTextFile: 1,
    });
    var loadTextFile = function (fileName, fileType, callbackFunction) {
        if (!GameEngine.Resources.isAssetLoaded(fileName)) {
            console.log(fileName, fileType);
            // Update resources in load counter.
            GameEngine.Resources.asyncLoadRequested(fileName);

            // Asyncrounsly request the data from server.
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState === 4 && req.status !== 200) {
                    throw new Error(
                        fileName +
                            `: loading failed!\n[Hint: you cannot double click index.html to run this project.\n"The index.html file must be loaded by a web-server.]`,
                    );
                }
            };
            req.open('GET', fileName, true);
            req.setRequestHeader('Content-Type', 'text/xml');

            req.onload = function () {
                var fileContent = null;
                if (fileType === eTextFileType.eXMLFile) {
                    var parser = new DOMParser();
                    fileContent = parser.parseFromString(req.responseText, 'text/xml');
                } else {
                    fileContent = req.responseText;
                }
                GameEngine.Resources.asyncLoadCompleted(fileName, fileContent);

                if (callbackFunction !== null && callbackFunction !== undefined) callbackFunction(fileName);
            };
            req.send();
        } else {
            if (callbackFunction !== null && callbackFunction !== undefined) callbackFunction(fileName);
        }
    };
    var unloadTextFile = function (fileName) {
        GameEngine.Resources.unload(fileName);
    };
    // Public interface for this object.
    var mPublic = {
        load: loadTextFile,
        unload: unloadTextFile,
        eTextFileType: eTextFileType,
    };
    return mPublic;
})();
