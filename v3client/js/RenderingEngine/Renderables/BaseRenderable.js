/**
 * @typedef {[red:number, green:number, blue:number, alpha:number]} Color
 */
import Camera from '../Camera.js';
import Transform from '../Transform.js';
export default class BaseRenderable {
    constructor() {
        this._shader = RenderingEngine.Resources.globals.solidShader; // the shader for shading this object
        /**
         * Color for the fragment shader
         * @type {Color}
         */
        this.color = [1, 1, 1, 1]; // Color for fragment shader
        /**
         * Transform operator for the renderable
         * @type {Transform}
         */
        this._transform = new Transform(); // transform operator for the object
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera) {
        const webgl = RenderingEngine.Core.webgl;
        this._shader.activate(this.color, camera.vpMatrix);
        this._shader.loadObjectTransform(this._transform.getMatrix());
        webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
    }
}
