import { vec2, vec3, mat4 } from '../lib/index.js';
export default class Transform {
    constructor() {
        this.mPosition = vec2.fromValues(0, 0); // translation operator
        this.mScale = vec2.fromValues(1, 1); // Scaling operator
        this.mRotationInRad = 0.0; // Rotation in radians!
    }
    setXPos(xPos) {
        this.mPosition[0] = xPos;
    }
    setYPos(yPos) {
        this.mPosition[1] = yPos;
    }
    getXPos() {
        return this.mPosition[0];
    }
    getYPos() {
        return this.mPosition[1];
    }
    setWidth(width) {
        this.mScale[0] = width;
    }
    setHeight(height) {
        this.mScale[1] = height;
    }
    getWidth() {
        return this.mScale[0];
    }
    getHeight() {
        return this.mScale[1];
    }
    incXPosBy(deltaX) {
        this.mPosition[0] += deltaX;
    }
    incSizeBy(delta) {
        this.mScale[0] += (delta * this.mScale[0]) / this.mScale[1];
        this.mScale[1] += (delta * this.mScale[1]) / this.mScale[0];
    }
    multSizeBy(delta) {
        this.mScale[0] *= Math.sqrt(delta);
        this.mScale[1] *= Math.sqrt(delta);
    }
    incRotationByDegree(deltaDeg) {
        this.mRotationInRad += (Math.PI / 180) * deltaDeg;
    }
}
// Position getters and setters
Transform.prototype.setPosition = function (xPos, yPos) {
    this.setXPos(xPos);
    this.setYPos(yPos);
};
Transform.prototype.getPosition = function () {
    return this.mPosition;
};
// ... additional get and set functions for position not shown
// Size setters and getters
Transform.prototype.setSize = function (width, height) {
    this.setWidth(width);
    this.setHeight(height);
};
Transform.prototype.getSize = function () {
    return this.mScale;
};
// ... additional get and set functions for size not shown
// Rotation getters and setters
Transform.prototype.setRotationInRad = function (rotationInRadians) {
    this.mRotationInRad = rotationInRadians;
    while (this.mRotationInRad > 2 * Math.PI) this.mRotationInRad -= 2 * Math.PI;
};
Transform.prototype.setRotationInDegree = function (rotationInDegree) {
    this.setRotationInRad((rotationInDegree * Math.PI) / 180.0);
};
Transform.prototype.getRotationInRad = function () {
    return this.mRotationInRad;
};
// ... additional get and set functions for rotation not show
Transform.prototype.getXform = function () {
    // Creates a blank identity matrix
    var matrix = mat4.create();

    // Step 1: compute translation, for now z is always at 0.0
    mat4.translate(matrix, matrix, vec3.fromValues(this.getXPos(), this.getYPos(), 0.0));
    // Step 2: concatenate with rotation.
    mat4.rotateZ(matrix, matrix, this.getRotationInRad());
    // Step 3: concatenate with scaling
    mat4.scale(matrix, matrix, vec3.fromValues(this.getWidth(), this.getHeight(), 1.0));
    return matrix;
};
