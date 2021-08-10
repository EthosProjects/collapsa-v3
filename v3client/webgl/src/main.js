import '/js/RenderingEngine/core/main.js';
import GameplayScene from './Scenes/GameplayScene.js';
let gameplayScene = new GameplayScene();
RenderingEngine.Core.initialize(gameplayScene);
//console.log(RenderingEngine.DefaultResources.getTextureShader()._shaderTextureCoordAttribute);
