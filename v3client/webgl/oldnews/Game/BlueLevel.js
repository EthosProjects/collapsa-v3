import MyGame from './Game.js';
import Scene from '/js/RenderingEngine/Scene.js';
import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
export default class BlueLevel extends Scene {
    constructor() {
        super();
        // scene file name
        this.kSceneFile = 'assets/BlueLevel.xml';
        // textures: ( Note: jpg does not support transparency )
        this.kPortal = 'assets/minion_portal.png';
        this.kCollector = 'assets/minion_collector.png';

        // all squares
        this.mSqSet = []; // these are the renderable objects
        // The camera to view the scene
        this.mCamera = null;
    }
}
BlueLevel.prototype.loadScene = function () {
    RenderingEngine.TextFileLoader.loadTextFile(this.kSceneFile, RenderingEngine.TextFileLoader.eTextFileType.eXMLFile);
    // load the textures
    RenderingEngine.Textures.loadTexture(this.kPortal);
    RenderingEngine.Textures.loadTexture(this.kCollector);
};
BlueLevel.prototype.initialize = function () {
    let sceneParser = new SceneFileParser(this.kSceneFile);
    this.mCamera = sceneParser.parseCamera();
    sceneParser.parseRenderables(this.mSqSet);
};
BlueLevel.prototype.draw = function () {
    document.getElementById('GLCanvas').width = window.innerWidth;
    document.getElementById('GLCanvas').height = window.innerHeight;
    // Step A: clear the canvas
    RenderingEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();
    for (var i = 0; i < this.mSqSet.length; i++) {
        this.mSqSet[i].draw(this.mCamera.getVPMatrix());
    }
};
BlueLevel.prototype.update = function () {
    // For this very simple game, let's move the first square
    var xform = this.mSqSet[0].getXform();
    var deltaX = 0.05;

    /// Move right and swap over
    if (RenderingEngine.Input.isKeyPressed(RenderingEngine.Input.keys.Right)) {
        xform.incXPosBy(deltaX);
        if (xform.getXPos() > 30) {
            // this is the right-bound of the window
            xform.setPosition(12, 60);
        }
    }

    // Step A: test for white square movement
    if (RenderingEngine.Input.isKeyPressed(RenderingEngine.Input.keys.Left)) {
        xform.incXPosBy(-deltaX);
        if (xform.getXPos() < 11) {
            // this is the left-boundary
            RenderingEngine.GameLoop.stop();
        }
    }

    // continously change texture tinting
    var c = this.mSqSet[1].getColor();
    var ca = c[3] + deltaX;
    if (ca > 1) {
        ca = 0;
    }
    c[3] = ca;
};
BlueLevel.prototype.unloadScene = function () {
    // unload the scene flie
    RenderingEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    RenderingEngine.Textures.unloadTexture(this.kPortal);
    RenderingEngine.Textures.unloadTexture(this.kCollector);

    var nextLevel = new MyGame(); // the next level
    RenderingEngine.Core.startScene(nextLevel);
};
