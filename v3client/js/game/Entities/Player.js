import { BaseEntity } from '../../RenderingEngine/Entities/exports.js';
import { BaseRenderable, SpriteRenderable, TextureRenderable } from '../../RenderingEngine/Renderables/exports.js';
import Camera from '../../RenderingEngine/Camera.js';
import { mat4 } from '../../glMatrix/index.js';
export default class Player extends BaseEntity {
    constructor({ id, position, velocity, username }) {
        super(new TextureRenderable('/img/playerBody.png'));
        /**
         * @type {TextureRenderable[]}
         */
        this.renderables = [
            this._renderable,
            new TextureRenderable('/img/playerHand.png'),
            new TextureRenderable('/img/playerHand.png'),
        ];
        this.id = id;
        this.clientView = {
            position: { ...position },
            velocity: { ...velocity },
            hands: {
                id: 0,
                percent: 0.0,
                rate: 2,
            },
        };
        this.serverView = {
            position: { ...position },
            velocity: { ...velocity },
            hands: {
                id: 0,
                rate: 0.0,
            },
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
        const { clientView, serverView } = this;
        clientView.position.x += clientView.velocity.x * delta;
        clientView.position.y += clientView.velocity.y * delta;
        serverView.position.x += serverView.velocity.x * delta;
        serverView.position.y += serverView.velocity.y * delta;
        if (clientView.hands.percent == 1) {
            clientView.hands.percent = 0;
            if (clientView.hands.id < 2) clientView.hands.id = clientView.hands.id ^ 1;
            clientView.hands.id = (clientView.hands.id & 1) + (serverView.hands.id << 1);
            clientView.hands.rate = serverView.hands.rate;
        } else if (
            clientView.hands.percent == 0 &&
            (serverView.hands.rate != clientView.hands.rate || clientView.hands.id << 1 != serverView.hands.id)
        ) {
            clientView.hands.id = (clientView.hands.id & 1) + (serverView.hands.id << 1);
            clientView.hands.rate = serverView.hands.rate;
        }
        clientView.hands.percent += delta * clientView.hands.rate;
        if (clientView.hands.percent > 1) {
            clientView.hands.percent = 1;
        }
    }
    update(delta) {
        this.predict(delta);
        this.reconcilliate(delta);
    }
    pushUpdate({ position, velocity }) {
        this.serverView.position = { ...position };
        this.serverView.velocity = { ...velocity };
        this.clientView.velocity = { ...velocity };
    }
    animateUpdate({ rotation, hands }) {
        this._renderable._transform.setRotationInDegree((rotation * 360) / 255);
        //this.serverView.hands.id = hands.id;
        if (hands.active == 0) {
            this.serverView.hands.rate = 0;
        } else {
            switch (hands.id) {
                case 0:
                    this.serverView.hands.rate = 2;
                    break;
            }
        }
    }
    assertPosition() {
        const { serverView, clientView } = this;
        let minX = 16;
        let maxX = 239;
        let minY = 16;
        let maxY = 239;
        if (serverView.position.x < minX) serverView.position.x = minX;
        if (serverView.position.y < minY) serverView.position.y = minY;
        if (clientView.position.x < minX) clientView.position.x = minX;
        if (clientView.position.y < minY) clientView.position.y = minY;
        if (serverView.position.x > maxX) serverView.position.x = maxX;
        if (serverView.position.y > maxY) serverView.position.y = maxY;
        if (clientView.position.x > maxX) clientView.position.x = maxX;
        if (clientView.position.y > maxY) clientView.position.y = maxY;
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
        const [bodyTransform, leftHandTransform, rightHandTransform] = this.renderables.map((r) => r._transform);
        bodyTransform.scale = new Float32Array([32 * resolution, 32 * resolution]);
        rightHandTransform.scale = new Float32Array([(15 / 25) * 16 * resolution, (15 / 25) * 16 * resolution]);
        leftHandTransform.scale = new Float32Array([(15 / 25) * 16 * resolution, (15 / 25) * 16 * resolution]);
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
        //Draw left hand
        leftHandTransform.position = new Float32Array([(20.48 - 4.8) * resolution, (9.6 - 4.8) * resolution]);
        const leftHandMatrix = mat4.clone(mainMatrix);
        mat4.rotateZ(leftHandMatrix, leftHandMatrix, this._renderable._transform.rotation);
        mat4.translate(leftHandMatrix, leftHandMatrix, new Float32Array([4.8 * resolution, 4.8 * resolution, 0]));
        if (clientView.hands.id == 0) {
            mat4.rotateZ(
                leftHandMatrix,
                leftHandMatrix,
                (Math.PI / 180) * (30 * Math.abs(clientView.hands.percent - 0.5) - 15),
            );
        }
        this.renderables[1].draw(camera, leftHandMatrix);
        //Draw right hand
        rightHandTransform.position = new Float32Array([(20.48 - 4.8) * resolution, -(9.6 - 4.8) * resolution]);
        const rightHandMatrix = mat4.clone(mainMatrix);
        mat4.rotateZ(rightHandMatrix, rightHandMatrix, this._renderable._transform.rotation);
        mat4.translate(rightHandMatrix, rightHandMatrix, new Float32Array([4.8 * resolution, -4.8 * resolution, 0]));
        if (this.clientView.hands.id == 1)
            mat4.rotateZ(
                rightHandMatrix,
                rightHandMatrix,
                (Math.PI / 180) * (-30 * Math.abs(clientView.hands.percent - 0.5) + 15),
            );
        this.renderables[2].draw(camera, rightHandMatrix);
    }
}
