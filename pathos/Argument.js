export default class Argument {
    constructor(options) {
        this._name = Math.random().toString(16);
        this.nameStartsWithVowel = false;
        this.optional = true;
        this.type = 'unknown';
        this.description = 'Argument';
        this.default = false;
        Object.assign(this, options);
    }
    get name() {
        return this.optional ? `?${this._name}` : this._name;
    }
    get text() {
        return `${this.nameStartsWithVowel ? 'an' : 'a'} ${this.name}`;
    }
}
