import { BaseEntity } from '../../RenderingEngine/Entities/exports.js';
import { BaseRenderable, SpriteRenderable, TextureRenderable } from '../../RenderingEngine/Renderables/exports.js';
import Camera from '../../RenderingEngine/Camera.js';
import { mat4 } from '../../glMatrix/index.js';
export default class Player extends BaseEntity {
    constructor({ id, position, velocity, username }) {
        const resolution = 1920 / 320;
        /**
         * @type {TextureRenderable}
         */
        const bodyRenderable = new TextureRenderable('/img/playerBody.png');
        bodyRenderable._transform.scale = new Float32Array([32 * resolution, 32 * resolution]);
        const leftHand = new TextureRenderable('/img/playerHand.png');
        leftHand._transform.position = new Float32Array([position.x * resolution, position.y * resolution]);
        leftHand._transform.scale = new Float32Array([32 * resolution, 32 * resolution]);
        const rightHand = new TextureRenderable('/img/playerHand.png');
        super(bodyRenderable);
        this.renderables = [bodyRenderable, leftHand, rightHand];
        this.id = id;
        this.clientView = {
            position: { ...position },
            velocity: { ...velocity },
        };
        this.serverView = {
            position: { ...position },
            velocity: { ...velocity },
        };
    }
    reconcilliate(delta) {
        let xDifference = this.serverView.position.x - this.clientView.position.x;
        let yDifference = this.serverView.position.y - this.clientView.position.y;
        if (xDifference > 16 || xDifference < -16) this.clientView.position.x = this.serverView.position.x;
        if (yDifference > 16 || yDifference < -16) this.clientView.position.y = this.serverView.position.y;
        this.clientView.position.x += xDifference * delta;
        this.clientView.position.y += yDifference * delta;
    }
    predict(delta) {
        this.serverView.position.x += this.serverView.velocity.x * delta;
        this.serverView.position.y += this.serverView.velocity.y * delta;
    }
    update(delta) {
        this.clientView.position.x += this.clientView.velocity.x * delta;
        this.clientView.position.y += this.clientView.velocity.y * delta;
        this.predict(delta);
        this.reconcilliate(delta);
    }
    pushUpdate(data) {
        this.serverView.position = { ...data.position };
        this.serverView.velocity = { ...data.velocity };
        this.clientView.velocity = { ...data.velocity };
        this._renderable._transform.setRotationInDegree((data.rotation * 360) / 255);
    }
    assertPosition() {
        let minX = 16;
        let maxX = 239;
        let minY = 16;
        let maxY = 239;
        if (this.serverView.position.x < minX) this.serverView.position.x = minX;
        if (this.serverView.position.y < minY) this.serverView.position.y = minY;
        if (this.clientView.position.x < minX) this.clientView.position.x = minX;
        if (this.clientView.position.y < minY) this.clientView.position.y = minY;
        if (this.serverView.position.x > maxX) this.serverView.position.x = maxX;
        if (this.serverView.position.y > maxY) this.serverView.position.y = maxY;
        if (this.clientView.position.x > maxX) this.clientView.position.x = maxX;
        if (this.clientView.position.y > maxY) this.clientView.position.y = maxY;
    }
    /**
     *
     * @param {Camera} camera
     */
    draw(camera) {
        let mainMatrix = mat4.create();
        this.assertPosition();
        const resolution = camera._width / 320;
        const { serverView, clientView } = this;
        const [bodyTransform, rightHandTransform, leftHandTransform] = this.renderables.map((r) => r._transform);
        bodyTransform.scale = new Float32Array([32 * resolution, 32 * resolution]);
        rightHandTransform.scale = new Float32Array([9 * resolution, 9 * resolution]);
        leftHandTransform.scale = new Float32Array([9 * resolution, 9 * resolution]);
        mat4.translate(
            mainMatrix,
            mainMatrix,
            new Float32Array([clientView.position.x * resolution, clientView.position.y * resolution, 0.0]),
        );
        bodyTransform.position = new Float32Array([
            serverView.position.x * resolution,
            serverView.position.y * resolution,
        ]);
        this._renderable.color = [0, 0, 1, 1];
        this._renderable.draw(camera);
        this._renderable.color = [0, 0, 0, 0];
        bodyTransform.position = new Float32Array([
            clientView.position.x * resolution,
            clientView.position.y * resolution,
        ]);
        this.renderables[0].draw(camera);
        this.renderables[1].draw(camera);
        this.renderables[2].draw(camera);
    }
}
