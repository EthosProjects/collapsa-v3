'use strict';
window.GameEngine = window.GameEngine || {};
GameEngine.Core = (function () {
    // instance variable: the graphical context for drawing
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById('GLCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const webgl = canvas.getContext('webgl2', { alpha: false });
    if (webgl == null) {
        document.write('<br><b>WebGL is not supported!</b>');
        throw new Error('WebGL is not supported.');
    }
    // Allows transperency with textures.
    webgl.blendFunc(webgl.SRC_ALPHA, webgl.ONE_MINUS_SRC_ALPHA);
    webgl.enable(webgl.BLEND);
    // Set images to flip the y axis to match the texture coordinate space.
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
    var startScene = function (myGame) {
        myGame.loadScene(); // Called in this way to keep correct context
        GameEngine.GameLoop.start(myGame); // start the game loop after initialization
    };
    var initializeEngineCore = function (myGame) {
        GameEngine.VertexBuffer.initialize();
        GameEngine.Input.initialize();
        // Inits DefaultResoruces, when done, invoke startScene(myGame).
        GameEngine.DefaultResources.initialize(function () {
            startScene(myGame);
        });
    };
    // Contains the functions and variables that will be accessible.
    let mPublic = {
        /**
         * Accessor of the webgl context
         */
        getGL: () => webgl,
        initializeEngineCore: initializeEngineCore,
        clearCanvas: (color) => {
            webgl.clearColor(color[0], color[1], color[2], color[3]); // set the color to    be cleared
            webgl.clear(webgl.COLOR_BUFFER_BIT); // clear to the color previously set
        },
        startScene,
        webgl,
    };
    return mPublic;
})();
