import BaseEntity from './BaseEntity.js';
import { SpriteRenderable } from '../Renderables/exports.js';
export default class DyePack extends BaseEntity {
    constructor() {
        const referenceWidth = 80;
        const referenceHeight = 130;
        const renderable = new SpriteRenderable();
        renderable.setColor([1, 1, 1, 0.1]);
        renderable._transform.position = new Float32Array([50, 33]);
        renderable._transform.scale = new Float32Array([referenceWidth / 50, referenceHeight / 50]);
        renderable.setElementPixelPositions(510, 595, 23, 153);
        super(renderable);
    }
}
