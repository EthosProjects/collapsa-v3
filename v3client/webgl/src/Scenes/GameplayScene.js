import Scene from '/js/RenderingEngine/Scene.js';
import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
import { FontRenderable, FontRenderable2 } from '/js/RenderingEngine/Renderables/exports.js';
export default class GameplayScene extends Scene {
    constructor() {
        super();
        this._sceneFile = '/xml/scenes/webglScene.xml';
        this._imageAssets = [
            '/assets/minion_portal.png',
            '/assets/minion_collector.png',
            '/assets/Consolas-72.png',
            '/assets/minion_sprite.png',
        ];
    }
    load() {
        RenderingEngine.Resources.Text.load(this._sceneFile, RenderingEngine.Resources.Text.FileType.XMLFile);
        for (let i = 0; i < this._imageAssets.length; i++) RenderingEngine.Resources.Texture.load(this._imageAssets[i]);
    }
    unload() {
        RenderingEngine.Resources.Text.unload(this._sceneFile); // Game loop not running, unload all assets
        for (let i = 0; i < this._imageAssets.length; i++)
            RenderingEngine.Resources.Texture.unload(this._imageAssets[i]);
    }
    initialize() {
        let sceneParser = new SceneFileParser(this._sceneFile);
        this._camera = sceneParser.parseCamera();
        this.renderables = sceneParser.parseRenderables();
        this.mTextSysFont = new FontRenderable2('System Font: in Red');
        this._initText(this.mTextSysFont, 50, 60, [1, 0, 0, 1], 3);
    }
    update(delta) {}
    draw() {
        // Step A: clear the canvas
        RenderingEngine.Core.resizeCanvas();
        RenderingEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
        // Step  B: Activate the drawing Camera
        this._camera.setupViewProjection();
        for (var i = 0; i < this.renderables.length; i++) {
            this.renderables[i].draw(this._camera);
        }
        this.mTextSysFont.draw(this._camera);
        RenderingEngine.Loop.stop();
    }
    _initText(font, posX, posY, color, textH) {
        console.log(font, posX, posY);
        font.character.color = color;
        font._transform.position[0] = posX;
        font._transform.position[1] = posY;
        font.setTextHeight(textH);
    }
}
