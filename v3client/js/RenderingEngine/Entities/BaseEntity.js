import { BaseRenderable } from '../Renderables/exports.js';
export default class BaseEntity {
    constructor(renderable) {
        /**
         * @type {BaseRenderable}
         */
        this._renderable = renderable;
    }
    get transform() {
        return this._renderable.transform;
    }
    update() {}
    draw(camera) {
        this._renderable.draw(camera);
    }
}
