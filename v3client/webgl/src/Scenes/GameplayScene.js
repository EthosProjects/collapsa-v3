import Scene from '/js/RenderingEngine/Scene.js';
import SceneFileParser from '/js/RenderingEngine/util/SceneFileParser.js';
export default class GameplayScene extends Scene {
    constructor() {
        super();
        this._sceneFile = '/xml/scenes/gameplayScene.xml';
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
        console.log(RenderingEngine.Resources.isLoaded(this._sceneFile));
        let sceneParser = new SceneFileParser(this._sceneFile);
        this._camera = sceneParser.parseCamera();
        this.renderables = sceneParser.parseRenderables();
        console.log(this.renderables);
    }
    update(delta) {}
    draw() {
        // Step A: clear the canvas
        RenderingEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
        RenderingEngine.Core.resizeCanvas();
        // Step  B: Activate the drawing Camera
        this._camera.setupViewProjection();
        for (var i = 0; i < this.renderables.length; i++) {
            this.renderables[i].draw(this._camera);
        }
    }
}
