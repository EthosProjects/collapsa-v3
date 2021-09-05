import { BaseEntity } from '../../RenderingEngine/Entities/exports.js';
import { TextureRenderable } from '../../RenderingEngine/Renderables/exports.js';
import Camera from '../../RenderingEngine/Camera.js';
export default class Tree extends BaseEntity {
    constructor({ id, position }) {
        console.log(arguments);
        super(new TextureRenderable('/img/tree/tree-1080.png'));
        this.id = id;
        this.clientView = {
            position: { ...position },
        };
        this.serverView = {
            position: { ...position },
        };
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera) {
        const resolution = camera._width / 320;
        const { clientView } = this;
        const bodyTransform = this._renderable._transform;
        this._renderable.color = [0, 0, 0, 0];
        bodyTransform.scale = new Float32Array([70.4 * resolution, 70.4 * resolution]);
        bodyTransform.position = new Float32Array([
            clientView.position.x * resolution,
            clientView.position.y * resolution,
        ]);
        this._renderable.draw(camera);
    }
}
