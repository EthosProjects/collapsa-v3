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
        this.clientView = {
            position: { ...position },
            velocity: { ...velocity },
        };
        this.serverView = {
            position: { ...position },
            velocity: { ...velocity },
        };
    }
    reconcilliate() {
        let xDifference = this.serverView.position.x - this.clientView.position.x;
        let yDifference = this.serverView.position.y - this.clientView.position.y;
        if (xDifference > 10 || xDifference < -10) this.clientView.position.x = this.serverView.position.x;
        if (yDifference > 10 || yDifference < -10) this.clientView.position.y = this.serverView.position.y;
        this.clientView.position.x += xDifference * delta;
        this.clientView.position.y += yDifference * delta;
    }
    predict() {
        this.serverView.position.x += this.serverView.velocity.x * delta;
        this.serverView.position.y += this.serverView.velocity.y * delta;
    }
    update(delta) {
        this.clientView.position.x += this.clientView.velocity.x * delta;
        this.clientView.position.y += this.clientView.velocity.y * delta;
        this.predict();
        this.reconcilliate();
    }
    pushUpdate(data) {
        this.serverView.position = { ...data.position };
        this.serverView.velocity = { ...data.velocity };
        this.clientView.velocity = { ...data.velocity };
        this._renderable._transform.setRotationInDegree((data.rotation * 360) / 255);
    }
    draw(camera) {
        this._renderable._transform.position = new Float32Array([
            this.serverView.position.x * (1920 / 320),
            this.serverView.position.y * (1920 / 320),
        ]);
        this._renderable.color = [0, 0, 1, 1];
        this._renderable.draw(camera);
        this._renderable._transform.position = new Float32Array([
            this.clientView.position.x * (1920 / 320),
            this.clientView.position.y * (1920 / 320),
        ]);
        this._renderable.color = [0, 0, 0, 0];
        this._renderable.draw(camera);
    }
}
