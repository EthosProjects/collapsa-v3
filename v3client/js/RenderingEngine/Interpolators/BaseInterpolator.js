export default class BaseInterpolator {
    constructor(rate) {
        this._rate = rate;
        this._iRate = rate;
        this._fRate = rate;
        this.start = Date.now();
    }
    get rate() {
        return this._rate;
    }
    continueRate(f1, i2, f2) {
        console.log('l');
        if (f1 == i2 || f2 == i2) return;
        if (f2 < i2 && i2 < f1) return;
        if (f2 > i2 && i2 > f1) return;
        this._rate = 1 - (1 - this._rate) ** ((i2 - f1) / (i2 - f2));
        this._iRate = this._rate;
    }
    updateRate(t = (Date.now() - this.start) / 1000) {
        this._rate = this._fRate - (this._fRate - this._iRate) * (1 - this._fRate) ** t;
    }
}
