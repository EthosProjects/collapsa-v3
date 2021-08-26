/**
 * @typedef {[red:number, green:number, blue:number, alpha:number]} Color
 */
import { mat4 } from '../../glMatrix/index.js';
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
     * @param {matrix}
     */
    draw(camera, matrix) {
        if (!matrix) matrix = mat4.create();
        const webgl = RenderingEngine.Core.webgl;
        this._shader.activate(this.color, camera.vpMatrix);
        let transformationMatrix = this._transform.getMatrix();
        let objectTransform = mat4.create();
        mat4.multiply(objectTransform, matrix, transformationMatrix);
        this._shader.loadObjectTransform(objectTransform);
        webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
    }
}
