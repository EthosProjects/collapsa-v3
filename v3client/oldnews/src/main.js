import MyGame from './Game/Game.js';
document.body.onload = () => {
    var myGame = new MyGame();
    gEngine.Core.initializeEngineCore('GLCanvas', myGame);
};
