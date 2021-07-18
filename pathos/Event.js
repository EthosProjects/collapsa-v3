import Bot from './Bot.js';
export default class Event {
    constructor(options) {
        this._name = Math.random().toString(16);
        /**
         * @type {Bot}
         */
        this.client = null;
        Object.assign(this, options);
    }
}
