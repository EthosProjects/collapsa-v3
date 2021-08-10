import { BaseEntity } from '../../RenderingEngine/Entities/exports.js';
import { BaseRenderable, SpriteRenderable, TextureRenderable } from '../../RenderingEngine/Renderables/exports.js';
export default class Player extends BaseEntity {
    constructor({ id, position, velocity, username }) {
        /**
         * @type {TextureRenderable}
         */
        const renderable = new TextureRenderable('/img/playerBody.png');
        renderable._transform.position = new Float32Array([(position.x * 1920) / 320, (position.y * 1920) / 320]);
        renderable._transform.scale = new Float32Array([192, 192]);
        super(renderable);
        this.id = id;
        this._position = {
            x: position.x,
            y: position.y,
        };
    }
    update(delta) {
        this._renderable._transform.position = new Float32Array([
            (this._position.x * 1920) / 320,
            (this._position.y * 1920) / 320,
        ]);
    }
}
