import { mat4 } from '../glMatrix/index.js';
import { VectorInterpolator } from './Interpolators/exports.js';
const webgl = RenderingEngine.Core.webgl;
class CameraShake {
    constructor(x, y, t, f) {
        this._x = x;
        this._y = y;
        this._t = t;
        this._f = f;
        this._start = Date.now();
    }
    get x() {
        const t = (Date.now() - this._start) / 1000;
        const normal = ((this.t - t) / this.t) ** 2 * Math.cos(2 * Math.PI * this._f * t);
        return this._x * normal;
    }
    get y() {
        const t = (Date.now() - this._start) / 1000;
        const normal = ((this.t - t) / this.t) ** 2 * Math.cos(2 * Math.PI * this._f * t);
        return this._y * normal;
    }
    get t() {
        return this._t;
    }
    update() {
        if (Math.random() < 0.2) this._x *= -1;
        if (Math.random() < 0.2) this._y *= -1;
    }
}
export default class Camera {
    constructor(center, width, viewport) {
        // WC and viewport position and size
        this._center = new VectorInterpolator(center, 0.99);
        this._finalCenter = { ...center };
        this._width = width;
        this._viewport = viewport; // [x, y, width, height]
        this._nearPlane = 0;
        this._farPlane = 1000;
        // transformation matricies
        this._viewMatrix = mat4.create();
        this._projectionMatrix = mat4.create();
        this.vpMatrix = mat4.create();
        //background color
        this._bgColor = [0.8, 0.8, 0.8, 1]; // RGB and Alpha
        //shake
        this._shake = undefined;
    }
    setCenter(x, y) {
        this._finalCenter.x = x;
        this._finalCenter.y = y;
        this._center.value = this._finalCenter;
        this._center.instant();
    }
    moveCenter(x, y) {
        this._finalCenter.x = x;
        this._finalCenter.y = y;
    }
    update() {
        if (this._shake) {
            const t = (Date.now() - this._shake._start) / 1000;
            if (t > this._shake.t) {
                //Handle end of shake
                this._shake = undefined;
            } else {
                this._shake.update();
                this._center.value = {
                    x: this._finalCenter.x + this._shake.x,
                    y: this._finalCenter.y + this._shake.y,
                };
            }
        } else {
            this._center.value = this._finalCenter;
            this._center.update();
        }
    }
    shake(x, y, t, f) {
        this._shake = new CameraShake(x, y, t, f);
    }
    // Initializes the camera to begin drawing
    setupViewProjection() {
        // Step A: Configure the viewport
        // Step A1: Set up the viewport: area on canvas to be drawn
        webgl.viewport(
            this._viewport[0], // x position of bottom-left corner
            this._viewport[1], // y position of bottom-left corner
            this._viewport[2], // width of the area to be drawn
            this._viewport[3],
        ); // height of the area to be drawn

        // Step A2: set up the corresponding scissor area to limit clear area
        webgl.scissor(
            this._viewport[0], // x position of bottom-left corner
            this._viewport[1], // y position of bottom-left corner
            this._viewport[2], // width of the area to be drawn
            this._viewport[3],
        ); // height of the area to be drawn

        // Step A3: set the color to be clear to black
        webgl.clearColor(this._bgColor[0], this._bgColor[1], this._bgColor[2], this._bgColor[3]); // set the color to be cleared

        // Step A4: enable and clear the scissor area
        webgl.enable(webgl.SCISSOR_TEST);
        webgl.clear(webgl.COLOR_BUFFER_BIT);
        webgl.disable(webgl.SCISSOR_TEST);

        // Step B: define the View-Projection matrix
        // Step B1: define the view matrix
        mat4.lookAt(
            this._viewMatrix,
            [this._center.visualX, this._center.visualY, 10], // WC center
            [this._center.visualX, this._center.visualY, 0], //
            [0, 1, 0],
        ); // orientation

        // Step B2: define the projection matrix
        var halfWCWidth = 0.5 * this._width;
        var halfWCHeight = (halfWCWidth * this._viewport[3]) / this._viewport[2];
        // WCHeight = WCWidth * viewportHeight / viewportWidth
        mat4.ortho(
            this._projectionMatrix,
            -halfWCWidth, // distant to left of WC
            halfWCWidth, // distant to right of WC
            -halfWCHeight, // distant to bottom of WC
            halfWCHeight, // distant to top of WC
            this._nearPlane, // z-distant to near plane
            this._farPlane, // z-distant to far plane
        );

        // Step B3: concatnate view and project matrices
        mat4.multiply(this.vpMatrix, this._projectionMatrix, this._viewMatrix);
    }
}
