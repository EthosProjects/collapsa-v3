//import { vec2, vec3, mat4 } from '../lib/index.js';
import { mat4 } from '../glMatrix/index.js';
export default class Transform {
    constructor() {
        this.position = new Float32Array([0.0, 0.0]);
        this.scale = new Float32Array([1.0, 1.0]); // Scaling operator
        this.rotation = 0.0; // Rotation in radians!
    }
    setX(x) {
        this.position[0] = x;
    }
    setY(y) {
        this.position[1] = y;
    }
    getX() {
        return this.position[0];
    }
    getY() {
        return this.position[1];
    }
    setWidth(width) {
        this.scale[0] = width;
    }
    setHeight(height) {
        this.scale[1] = height;
    }
    getWidth() {
        return this.scale[0];
    }
    getHeight() {
        return this.scale[1];
    }
    increaseScaleBy(delta) {
        this.scale[0] += (delta * this.scale[0]) / this.scale[1];
        this.scale[1] += (delta * this.scale[1]) / this.scale[0];
    }
    multiplyScaleBy(delta) {
        this.scale[0] *= Math.sqrt(delta);
        this.scale[1] *= Math.sqrt(delta);
    }
    increaseRotationBy(delta) {
        this.rotation += (Math.PI / 180) * delta;
    }
    setRotationInRadians(rotationInRadians) {
        this.rotation = rotationInRadians;
        while (this.rotation > 2 * Math.PI) this.rotation -= 2 * Math.PI;
    }
    setRotationInDegree(rotationInDegrees) {
        this.setRotationInRadians((rotationInDegrees * Math.PI) / 180.0);
    }
    getMatrix() {
        // Creates a blank identity matrix
        let matrix = mat4.create();
        // Step 1: compute translation, for now z is always at 0.0
        mat4.translate(matrix, matrix, new Float32Array([this.getX(), this.getY(), 0.0]));
        // Step 2: concatenate with rotation.
        mat4.rotateZ(matrix, matrix, this.rotation);
        // Step 3: concatenate with scaling
        mat4.scale(matrix, matrix, new Float32Array([this.getWidth(), this.getHeight(), 1.0]));
        return matrix;
    }
}
