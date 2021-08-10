import MyGame from './Game.js';
import Scene from '../Engine/Scene.js';
import SceneFileParser from './Util/SceneFileParser.js';
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
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
    // load the textures
    gEngine.Textures.loadTexture(this.kPortal);
    gEngine.Textures.loadTexture(this.kCollector);
};
BlueLevel.prototype.initialize = function () {
    let sceneParser = new SceneFileParser(this.kSceneFile);
    this.mCamera = sceneParser.parseCamera();
    sceneParser.parseSquares(this.mSqSet);
    sceneParser.parseTextureSquares(this.mSqSet);
};
BlueLevel.prototype.draw = function () {
    document.getElementById('GLCanvas').width = window.innerWidth;
    document.getElementById('GLCanvas').height = window.innerHeight;
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
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
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        xform.incXPosBy(deltaX);
        if (xform.getXPos() > 30) {
            // this is the right-bound of the window
            xform.setPosition(12, 60);
        }
    }

    // Step A: test for white square movement
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        xform.incXPosBy(-deltaX);
        if (xform.getXPos() < 11) {
            // this is the left-boundary
            gEngine.GameLoop.stop();
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
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    gEngine.Textures.unloadTexture(this.kPortal);
    gEngine.Textures.unloadTexture(this.kCollector);

    var nextLevel = new MyGame(); // the next level
    gEngine.Core.startScene(nextLevel);
};
