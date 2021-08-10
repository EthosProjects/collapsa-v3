'use strict';
window.gEngine = window.gEngine || {};
gEngine.Core = (function () {
    // instance variable: the graphical context for drawing
    /**
     * @type {WebGLRenderingContext|null}
     */
    let mGL = null;
    var startScene = function (myGame) {
        myGame.loadScene.call(myGame); // Called in this way to keep correct context
        gEngine.GameLoop.start(myGame); // start the game loop after initialization
    };
    /**
     * initialize the WebGL
     * @param {string} htmlCanvasID
     */
    let _initializeWebGL = (htmlCanvasID) => {
        document.getElementById(htmlCanvasID).width = window.innerWidth;
        document.getElementById(htmlCanvasID).height = window.innerHeight;
        // Get the webgl and binds to the Canvas area and store the results to the instance variable mGL
        mGL = document.getElementById(htmlCanvasID).getContext('webgl', { alpha: false });
        // Allows transperency with textures.
        mGL.blendFunc(mGL.SRC_ALPHA, mGL.ONE_MINUS_SRC_ALPHA);
        mGL.enable(mGL.BLEND);

        // Set images to flip the y axis to match the texture coordinate space.
        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, true);

        if (mGL === null) {
            document.write('<br><b>WebGL is not supported!</b>');
            throw new Error('WebGL is not supported.');
        }
    };
    var initializeEngineCore = function (htmlCanvasID, myGame) {
        _initializeWebGL(htmlCanvasID);
        gEngine.VertexBuffer.initialize();
        gEngine.Input.initialize();

        // Inits DefaultResoruces, when done, invoke startScene(myGame).
        gEngine.DefaultResources.initialize(function () {
            startScene(myGame);
        });
    };
    // Contains the functions and variables that will be accessible.
    let mPublic = {
        /**
         * Accessor of the webgl context
         */
        getGL: () => mGL,
        initializeEngineCore: initializeEngineCore,
        clearCanvas: (color) => {
            mGL.clearColor(color[0], color[1], color[2], color[3]); // set the color to    be cleared
            mGL.clear(mGL.COLOR_BUFFER_BIT); // clear to the color previously set
        },
        startScene,
    };
    return mPublic;
})();
