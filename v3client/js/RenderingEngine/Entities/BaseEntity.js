export default class BaseEntity {
    constructor(renderable) {
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
