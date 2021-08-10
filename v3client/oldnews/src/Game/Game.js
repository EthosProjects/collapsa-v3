import SceneFileParser from './Util/SceneFileParser.js';
import Scene from '../Engine/Scene.js';
import BlueLevel from './BlueLevel.js';
import { Renderable, SpriteRenderable } from '../Engine/Renderables/export.js';
import Camera from '../Engine/Camera.js';
import { vec2 } from '../lib/index.js';
export default class MyGame extends Scene {
    constructor() {
        super();
        // textures:
        this.kMinionSprite = 'assets/minion_sprite.png'; // Portal and Collector are embedded here
        /**
         * The Camera to view the scene
         * @type {Camera}
         */
        this._camera = null;
        /**
         * The Renderable objects
         * @type {Renderable[]}
         */
        this.renderables = [];
        // scene file name
        this._sceneFile = '/webgl/assets/scene.xml';
        this._imageAssets = ['assets/minion_portal.png', 'assets/minion_collector.png', 'assets/Consolas-72.png'];
        // the hero and the support objects
        this.mHero = null;
        this.mPortal = null;
        this.mCollector = null;
        this.mFontImage = null;
        this.mMinion = null;
    }
    initialize() {
        let sceneParser = new SceneFileParser(this._sceneFile);
        //this._camera = sceneParser.parseCamera();
        this._camera = new Camera(
            vec2.fromValues(20, 60), // position of the camera
            20, // width of camera
            [20, 40, 600, 300], // viewport (orgX, orgY, width, height)
        );
        this._camera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        sceneParser.parseRenderables(this.renderables);
        // Step B: Create the support objects
        this.mPortal = new SpriteRenderable(this.kMinionSprite);
        this.mPortal.setColor([1, 0, 0, 0.2]); // tints red
        this.mPortal.getXform().setPosition(25, 60);
        this.mPortal.getXform().setSize(3, 3);
        this.mPortal.setElementPixelPositions(130, 310, 0, 180);

        this.mCollector = new SpriteRenderable(this.kMinionSprite);
        this.mCollector.setColor([0, 0, 0, 0]); // No tinting
        this.mCollector.getXform().setPosition(15, 60);
        this.mCollector.getXform().setSize(3, 3);
        this.mCollector.setElementPixelPositions(315, 495, 0, 180);

        // Step C: Create the font and minion images using sprite
        this.mFontImage = new SpriteRenderable(this.kFontImage);
        this.mFontImage.setColor([1, 1, 1, 0]);
        this.mFontImage.getXform().setPosition(13, 62);
        this.mFontImage.getXform().setSize(4, 4);

        this.mMinion = new SpriteRenderable(this.kMinionSprite);
        this.mMinion.setColor([1, 1, 1, 0]);
        this.mMinion.getXform().setPosition(26, 56);
        this.mMinion.getXform().setSize(5, 2.5);

        // Step D: Create the hero object with texture from the lower-left corner
        this.mHero = new SpriteRenderable(this.kMinionSprite);
        this.mHero.setColor([1, 1, 1, 0]);
        this.mHero.getXform().setPosition(20, 60);
        this.mHero.getXform().setSize(2, 3);
        this.mHero.setElementPixelPositions(0, 120, 0, 180);
    }
    loadScene() {
        gEngine.TextFileLoader.loadTextFile(this._sceneFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
        for (let i = 0; i < this._imageAssets.length; i++) gEngine.Textures.loadTexture(this._imageAssets[i]);
        // loads the textures
        gEngine.Textures.loadTexture(this.kFontImage);
        gEngine.Textures.loadTexture(this.kMinionSprite);
    }
    unloadScene() {
        gEngine.TextFileLoader.unloadTextFile(this._sceneFile); // Game loop not running, unload all assets
        for (let i = 0; i < this._imageAssets.length; i++) gEngine.Textures.unloadTexture(this._imageAssets[i]);
        gEngine.Textures.unloadTexture(this.kFontImage);
        gEngine.Textures.unloadTexture(this.kMinionSprite);
    }
    update() {
        // let's only allow the movement of hero,
        // and if hero moves too far off, this level ends, we will
        // load the next level
        var deltaX = 0.05;
        var xform = this.mHero.getXform();

        // Support hero movements
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
            xform.incXPosBy(deltaX);
            if (xform.getXPos() > 30) {
                // this is the right-bound of the window
                xform.setPosition(12, 60);
            }
        }

        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
            xform.incXPosBy(-deltaX);
            if (xform.getXPos() < 11) {
                // this is the left-bound of the window
                xform.setXPos(20);
            }
        }

        // continously change texture tinting
        var c = this.mPortal.getColor();
        var ca = c[3] + deltaX;
        if (ca > 1) {
            ca = 0;
        }
        c[3] = ca;

        // New update code for changing the sub-texture regions being shown"
        var deltaT = 0.001;

        // <editor-fold desc="The font image:">
        // zoom into the texture by updating texture coordinate
        // For font: zoom to the upper left corner by changing bottom right
        var texCoord = this.mFontImage.getElementUVCoordinateArray();
        // The 8 elements:
        //      mTexRight,  mTexTop,          // x,y of top-right
        //      mTexLeft,   mTexTop,
        //      mTexRight,  mTexBottom,
        //      mTexLeft,   mTexBottom
        var b = texCoord[SpriteRenderable.eTexCoordArray.eBottom] + deltaT;
        var r = texCoord[SpriteRenderable.eTexCoordArray.eRight] - deltaT;
        if (b > 1.0) {
            b = 0;
        }
        if (r < 0) {
            r = 1.0;
        }
        this.mFontImage.setElementUVCoordinate(
            texCoord[SpriteRenderable.eTexCoordArray.eLeft],
            r,
            b,
            texCoord[SpriteRenderable.eTexCoordArray.eTop],
        );
        // </editor-fold>

        // <editor-fold desc="The minion image:">
        // For minion: zoom to the bottom right corner by changing top left
        texCoord = this.mMinion.getElementUVCoordinateArray();
        // The 8 elements:
        //      mTexRight,  mTexTop,          // x,y of top-right
        //      mTexLeft,   mTexTop,
        //      mTexRight,  mTexBottom,
        //      mTexLeft,   mTexBottom
        var t = texCoord[SpriteRenderable.eTexCoordArray.eTop] - deltaT;
        var l = texCoord[SpriteRenderable.eTexCoordArray.eLeft] + deltaT;

        if (l > 0.5) {
            l = 0;
        }
        if (t < 0.5) {
            t = 1.0;
        }

        this.mMinion.setElementUVCoordinate(
            l,
            texCoord[SpriteRenderable.eTexCoordArray.eRight],
            texCoord[SpriteRenderable.eTexCoordArray.eBottom],
            t,
        );
    }
    draw() {
        // Step A: clear the canvas
        gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

        // Step  B: Activate the drawing Camera
        this._camera.setupViewProjection();

        // Step  C: Draw everything
        this.mPortal.draw(this._camera.getVPMatrix());
        this.mCollector.draw(this._camera.getVPMatrix());
        this.mHero.draw(this._camera.getVPMatrix());
        this.mFontImage.draw(this._camera.getVPMatrix());
        this.mMinion.draw(this._camera.getVPMatrix());

        /*
        const canvas = document.getElementById('GLCanvas')
        const screenCssPixelRatio = 1 //* window.outerWidth / window.innerWidth;
        canvas.width = window.innerWidth * screenCssPixelRatio;
        canvas.height = window.innerHeight * screenCssPixelRatio;
        //this._camera.setViewport([0, 0, canvas.width, canvas.height])
        // Step A: clear the canvas
        gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
        // Step  B: Activate the drawing Camera
        this._camera.setupViewProjection();
        // Step  C: Draw everything
        for (var i = 0; i<this.renderables.length; i++) {
            //this.renderables[i].draw(this._camera.getVPMatrix());
        }*/
    }
}
