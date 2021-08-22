export default class EntitySet extends Map {
    constructor(iteratable) {
        super(iteratable);
    }
    update(delta) {
        for (const [id, entity] of this) {
            entity.update(delta);
        }
    }
    draw(camera) {
        for (const [id, entity] of this) {
            entity.draw(camera);
        }
    }
}
