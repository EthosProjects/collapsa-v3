import BaseInterpolator from './BaseInterpolator.js';
export default class LinearInterpolator extends BaseInterpolator {
    constructor(value, rate) {
        super(rate);
        this._value = value;
        this._iValue = value;
        this._fValue = value;
    }
    set value(v) {
        const t = (Date.now() - this.start) / 1000;
        this.start += t * 1000;
        this.continueRate(this._fValue, this._value, v);
        this._fValue = v;
        this._iValue = this._value;
    }
    get value() {
        return this._fValue;
    }
    get visualValue() {
        return this._value;
    }
    setLooseValue(v) {
        const t = (Date.now() - this.start) / 1000;
        this.start += t * 1000;
        this._fValue = v;
        this._iValue = this._value;
    }
    update() {
        if (closeEnough(this._fValue, this._value)) {
            this._value = this._fValue;
            this._rate = this._fRate;
            return;
        }
        let t = (Date.now() - this.start) / 1000;
        this._value = this._fValue - (this._fValue - this._iValue) * (1 - this._rate) ** t;
        this.updateRate(t);
    }
}
