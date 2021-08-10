import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
import Scene from '/js/RenderingEngine/Scene.js';
import BlueLevel from './BlueLevel.js';
import { BaseRenderable, SpriteRenderable } from '/js/RenderingEngine/Renderables/exports.js';
import Camera from '/js/RenderingEngine/Camera.js';
export default class MyGame extends Scene {
    constructor() {
        super();
        // textures:
        this.kFontImage = 'assets/Consolas-72.png';
        this.kMinionSprite = 'assets/minion_sprite.png'; // Portal and Collector are embedded here
        /**
         * The Camera to view the scene
         * @type {Camera}
         */
        this._camera = null;
        /**
         * The BaseRenderable objects
         * @type {BaseRenderable[]}
         */
        this.renderables = [];
        // scene file name
        this._sceneFile = '/webgl/assets/scene.xml';
        this._imageAssets = [
            'assets/minion_portal.png',
            'assets/minion_collector.png',
            'assets/Consolas-72.png',
            'assets/minion_sprite.png',
        ];
        // the hero and the support objects
        this.mHero = null;
        this.mPortal = null;
        this.mCollector = null;
        this.mFontImage = null;
        this.mMinion = null;
    }
    initialize() {
        let sceneParser = new SceneFileParser(this._sceneFile);
        this._camera = sceneParser.parseCamera();
        this.renderables = sceneParser.parseRenderables();
        // Step C: Create the font and minion images using sprite
        this.mFontImage = new SpriteRenderable('assets/Consolas-72.png');
        this.mFontImage.color = [1, 1, 1, 0];
        this.mFontImage._transform._position = new Float32Array([13, 62]);
        this.mFontImage._transform._scale = new Float32Array([4, 4]);

        this.mMinion = new SpriteRenderable('assets/minion_sprite.png');
        this.mMinion.color = [1, 1, 1, 0];
        this.mMinion._transform._position = new Float32Array([26, 56]);
        this.mMinion._transform._scale = new Float32Array([5, 2.5]);

        // Step D: Create the hero object with texture from the lower-left corner
        this.mHero = new SpriteRenderable('assets/minion_sprite.png');
        this.mHero.color = [1, 1, 1, 0];
        this.mHero._transform._position = new Float32Array([20, 60]);
        this.mHero._transform._scale = new Float32Array([2, 3]);
        this.mHero.setElementPixelPositions(0, 120, 0, 180);
    }
    loadScene() {
        RenderingEngine.TextFileLoader.load(this._sceneFile, RenderingEngine.TextFileLoader.eTextFileType.eXMLFile);
        for (let i = 0; i < this._imageAssets.length; i++) RenderingEngine.Texture.load(this._imageAssets[i]);
    }
    unloadScene() {
        RenderingEngine.TextFileLoader.unload(this._sceneFile); // Game loop not running, unload all assets
        for (let i = 0; i < this._imageAssets.length; i++) RenderingEngine.Texture.unload(this._imageAssets[i]);
    }
    update() {
        // let's only allow the movement of hero,
        // and if hero moves too far off, this level ends, we will
        // load the next level
        var deltaX = 0.05;
        var xform = this.mHero._transform;
        // Support hero movements
        if (RenderingEngine.Input.isKeyPressed(RenderingEngine.Input.keys.Right)) {
            xform._position[0] += deltaX;
            if (xform.getX() > 30) {
                // this is the right-bound of the window
                xform._position[0] = 12;
                xform._position[1] = 60;
            }
        }
        if (RenderingEngine.Input.isKeyPressed(RenderingEngine.Input.keys.Left)) {
            xform._position[0] -= deltaX;
            if (xform.getX() < 11) {
                // this is the left-bound of the window
                xform.setX(20);
            }
        }

        // continously change texture tinting
        let portal = this.renderables[0];
        var c = portal.color;
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
        let fontImage = this.renderables[2];
        var texCoord = fontImage.getElementUVCoordinateArray();
        // The 8 elements:
        //      mTexRight,  mTexTop,          // x,y of top-right
        //      mTexLeft,   mTexTop,
        //      mTexRight,  mTexBottom,
        //      mTexLeft,   mTexBottom
        var b = texCoord[SpriteRenderable._textureCoordinateArray._bottom] + deltaT;
        var r = texCoord[SpriteRenderable._textureCoordinateArray._right] - deltaT;
        if (b > 1.0) {
            b = 0;
        }
        if (r < 0) {
            r = 1.0;
        }
        fontImage.setElementUVCoordinate(
            texCoord[SpriteRenderable._textureCoordinateArray._left],
            r,
            b,
            texCoord[SpriteRenderable._textureCoordinateArray._top],
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
        var t = texCoord[SpriteRenderable._textureCoordinateArray._top] - deltaT;
        var l = texCoord[SpriteRenderable._textureCoordinateArray._left] + deltaT;

        if (l > 0.5) {
            l = 0;
        }
        if (t < 0.5) {
            t = 1.0;
        }

        this.mMinion.setElementUVCoordinate(
            l,
            texCoord[SpriteRenderable._textureCoordinateArray._right],
            texCoord[SpriteRenderable._textureCoordinateArray._bottom],
            t,
        );
    }
    draw() {
        // Step A: clear the canvas
        RenderingEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

        // Step  B: Activate the drawing Camera
        this._camera.setupViewProjection();

        // Step  C: Draw everything
        this.mHero.draw(this._camera.vpMatrix);
        this.mMinion.draw(this._camera.vpMatrix);

        const canvas = document.getElementById('GLCanvas');
        const screenCssPixelRatio = 1; //* window.outerWidth / window.innerWidth;
        canvas.width = window.innerWidth * screenCssPixelRatio;
        canvas.height = window.innerHeight * screenCssPixelRatio;
        //this._camera.setViewport([0, 0, canvas.width, canvas.height])
        // Step  C: Draw everything
        for (var i = 0; i < this.renderables.length; i++) {
            this.renderables[i].draw(this._camera.vpMatrix);
        }
        if (!this.didLog) console.log(this.mHero, this.renderables[0]);
        this.didLog = true;
    }
}
