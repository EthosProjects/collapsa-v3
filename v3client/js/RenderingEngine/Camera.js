import { mat4 } from '../glMatrix/index.js';
import { VectorInterpolator } from './Interpolators/exports.js';
const webgl = RenderingEngine.Core.webgl;
export default class Camera {
    constructor(center, width, viewport) {
        // WC and viewport position and size
        this._center = new VectorInterpolator(center, 0.99);
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
    }
}
// Initializes the camera to begin drawing
Camera.prototype.setupViewProjection = function () {
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
};
