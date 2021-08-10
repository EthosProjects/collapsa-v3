import Camera from '/js/GameEngine/Camera.js';
import { vec2 } from '../../lib/index.js';
import { Renderable, TextureRenderable, SpriteRenderable } from '/js/GameEngine/Renderables/exports.js';
export default class SceneFileParser {
    constructor(sceneFilePath) {
        /**
         * @type {Document}
         */
        this._sceneXML = GameEngine.ResourceMap.retrieveAsset(sceneFilePath);
    }
    /**
     * Retrieves all elements of a specific tag
     * @param {string} tagName The name of the tag
     * @returns {HTMLCollectionOf<Element>} All elements with that tag name
     */
    _getElementsByTagName(tagName) {
        let elements = this._sceneXML.getElementsByTagName(tagName);
        if (elements.length === 0) console.error('Warning: Level element:[' + tagName + ']: is not found!');
        return elements;
    }
    parseCamera() {
        var camElm = this._getElementsByTagName('Camera');
        var cx = Number(camElm[0].getAttribute('CenterX'));
        var cy = Number(camElm[0].getAttribute('CenterY'));
        var w = Number(camElm[0].getAttribute('Width'));
        var viewport = camElm[0].getAttribute('Viewport').split(' ');
        var bgColor = camElm[0].getAttribute('BgColor').split(' ');
        // make sure viewport and color are number
        for (var j = 0; j < 4; j++) {
            bgColor[j] = Number(bgColor[j]);
            viewport[j] = Number(viewport[j]);
        }
        var cam = new Camera(
            vec2.fromValues(cx, cy), // position of the camera
            w, // width of camera
            viewport, // viewport (orgX, orgY, width, height)
        );
        cam.bgColor = bgColor;
        return cam;
    }
    parseRenderables(renderables) {
        let elements = this._sceneXML.querySelectorAll('[renderable=true]');
        for (let i = 0; i < elements.length; i++) {
            let attributes = elements[i].attributes;
            let renderingInfo = attributes
                .getNamedItem('renderingInfo')
                .value.split(' ')
                .map((n) => +n);
            let [x, y, w, h, r] = renderingInfo;
            let color = attributes
                .getNamedItem('color')
                .value.split(' ')
                .map((n) => +n);
            /**
             * @type {Renderable}
             */
            let renderable;
            if (attributes.getNamedItem('texture') !== null) {
                let t = attributes.getNamedItem('texture').value;
                if (attributes.getNamedItem('spritePixels') !== null) {
                    renderable = new SpriteRenderable(t);
                    let spritePixelCoordinates = attributes
                        .getNamedItem('spritePixels')
                        .value.split(' ')
                        .map((n) => +n);
                    renderable.setElementPixelPositions(...spritePixelCoordinates);
                } else renderable = new TextureRenderable(t);
            } else renderable = new Renderable();
            renderable.color = color;
            renderable._transform._position = new Float32Array([x, y]);
            renderable._transform._scale = new Float32Array([w, h]);
            renderables.push(renderable);
        }
    }
}
