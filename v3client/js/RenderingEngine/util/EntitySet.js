export default class EntitySet extends Map {
    constructor(iteratable) {
        super(iteratable);
    }
    update() {
        for (const [id, entity] of this) {
            entity.update();
        }
    }
    draw(camera) {
        for (const [id, entity] of this) {
            entity.draw(camera);
        }
    }
}
