import Scene from '/js/RenderingEngine/Scene.js';
let isRunning = false;
/**
 * @type {Scene}
 */
let sceneRunning = null;
let previousTime;
let frames = 0;
let renderingFrame = false;
let run = () => {
    if (!isRunning) return;
    if (renderingFrame) console.trace('Frame warping');
    renderingFrame = true;
    let now = Date.now();
    let delta = (now - previousTime) / 1000;
    previousTime = now;
    sceneRunning.update(delta);
    sceneRunning.draw();
    frames++;
    renderingFrame = false;
    requestAnimationFrame(run);
};
let readyScene = () => {
    sceneRunning.initialize();
    setInterval(() => {
        //console.log(frames)
        frames = 0;
    }, 1_000);
    return requestAnimationFrame(run);
};
let start = (scene) => {
    isRunning = true;
    previousTime = Date.now();
    sceneRunning = scene;
    if (!RenderingEngine.Resources.loadingAssets) readyScene();
    else RenderingEngine.Resources.loadPromise.then(readyScene);
};
let stop = () => (isRunning = false);
RenderingEngine.Loop = { stop, start };
