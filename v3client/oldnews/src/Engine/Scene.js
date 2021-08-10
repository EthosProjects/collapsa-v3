export default class Scene {
    constructor() {}
}
Scene.prototype.initialize = function () {
    // Called from GameLoop, after loading is done
};
Scene.prototype.loadScene = function () {
    // called from EngineCore.startScene()
};
Scene.prototype.unloadScene = function () {};
Scene.prototype.update = function () {};
Scene.prototype.draw = function () {};
