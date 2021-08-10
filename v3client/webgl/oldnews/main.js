import MyGame from './Game/Game.js';
document.body.onload = () => {
    var myGame = new MyGame();
    RenderingEngine.Core.initializeEngineCore(myGame);
    console.log('huh');
};
