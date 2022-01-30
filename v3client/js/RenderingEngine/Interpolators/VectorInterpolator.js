import BaseInterpolator from './BaseInterpolator.js';
export default class VectorInterpolator extends BaseInterpolator {
    constructor({ x, y }, rate) {
        super(rate);
        this._iX = x;
        this._vX = x;
        this._fX = x;
        this._iY = y;
        this._vY = y;
        this._fY = y;
    }
    update() {
        const t = (Date.now() - this.start) / 1000;
        const u = {
            x: this._fX - this._iX,
            y: this._fY - this._iY,
        };
        this._vX = this._fX - u.x * (1 - this._rate) ** t;
        this._vY = this._fY - u.y * (1 - this._rate) ** t;
        this.updateRate(t);
    }
    get x() {
        return this._fX;
    }
    set x(v) {
        const t = (Date.now() - this.start) / 1000;
        this._iX = this._vX = this._fX - (this._fX - this._iX) * (1 - this._rate) ** t;
        this._iY = this._vY = this._fY - (this._fY - this._iY) * (1 - this._rate) ** t;
        this.start += t * 1000;
        this._fX = v;
    }
    setTightX(v) {
        const t = (Date.now() - this.start) / 1000;

        this._vX = this._fX - (this._fX - this._iX) * (1 - this._rate) ** t;
        this._vY = this._fY - (this._fY - this._iY) * (1 - this._rate) ** t;
        this._iX = this._vX;
        this._iY = this._vY;

        this.start += t * 1000;
        this.continueRate(this._fX, this._vX, v);
        this._fX = v;
    }
    get y() {
        return this._fY;
    }
    set y(v) {
        const t = (Date.now() - this.start) / 1000;
        this._iX = this._vX = this._fX - (this._fX - this._iX) * (1 - this._rate) ** t;
        this._iY = this._vY = this._fY - (this._fY - this._iY) * (1 - this._rate) ** t;
        this.start += t * 1000;
        this._fY = v;
    }
    setTightY(v) {
        const t = (Date.now() - this.start) / 1000;
        this.update();
        this.start += t * 1000;
        this.continueRate(this._fY, this._vY, v);
        this._fY = v;
        this._iX = this._vX;
        this._iY = this._vY;
    }
    get visualX() {
        return this._vX;
    }
    get visualY() {
        return this._vY;
    }
    instant() {
        this._iX = this._vX = this._fX;
        this._iY = this._vY = this._fY;
    }
}
