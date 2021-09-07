import { SolidShader, TextureShader, SpriteShader } from '../../Shaders/exports.js';
// Simple Shader GLSL Shader file paths
const simpleVS = '/glsl/SimpleVS.glsl'; // Path to the VertexShader
const simpleFS = '/glsl/SimpleFS.glsl'; // Path to the simple FragmentShader
// Texture Shader
const textureVS = '/glsl/TextureVS.glsl'; // Path to VertexShader
const textureFS = '/glsl/TextureFS.glsl'; // Path to FragmentShader
// Default font
const defaultFont = '/assets/fonts/system-default-font';
import { Text as TextResource } from './text.js';
import { Font as FontResource } from './font.js';
await Promise.all([
    TextResource.load(simpleVS),
    TextResource.load(simpleFS),
    TextResource.load(textureVS),
    TextResource.load(textureFS),
    FontResource.load(defaultFont),
]);
const globals = {
    solidShader: new SolidShader(simpleVS, simpleFS),
    textureShader: new TextureShader(textureVS, textureFS),
    spriteShader: new SpriteShader(textureVS, textureFS),
    defaultFont,
    cleanup: () => {
        const { solidShader, textureShader, spriteShader } = RenderingEngine.Resources.global;
        solidShader.cleanup();
        textureShader.cleanUp();
        spriteShader.cleanUp();
        // simple shader
        TextResource.unload(simpleVS);
        TextResource.unload(simpleFS);
        // texture shader:
        TextResource.unload(textureVS);
        TextResource.unload(textureFS);
    },
};
export { globals };
