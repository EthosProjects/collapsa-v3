import Camera from '../Camera.js';
import { vec2 } from '../../glMatrix/index.js';
import { BaseRenderable, TextureRenderable, SpriteRenderable } from '../Renderables/exports.js';
export default class SceneFileParser {
    constructor(sceneFilePath) {
        /**
         * @type {Document}
         */
        this._sceneXML = RenderingEngine.Resources.retrieve(sceneFilePath);
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
        const cameraElement = this._getElementsByTagName('Camera')[0];
        const center = {
            x: Number(cameraElement.getAttribute('CenterX')),
            y: Number(cameraElement.getAttribute('CenterY')),
        };
        const width = Number(cameraElement.getAttribute('Width'));
        const viewport = cameraElement.getAttribute('Viewport').split(' ');
        const color = cameraElement.getAttribute('BgColor').split(' ');
        // make sure viewport and color are numbers
        for (let i = 0; i < 4; i++) {
            viewport[i] = Number(viewport[i]);
            color[i] = Number(color[i]);
        }
        const camera = new Camera(
            center, // position of the camera
            width, // width of the camera
            viewport, // viewport (orgX, orgY, width, height)
        );
        camera._bgColor = color;
        return camera;
    }
    parseRenderables() {
        let elements = this._sceneXML.querySelectorAll('[renderable=true]');
        let renderables = [];
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
            } else renderable = new BaseRenderable();
            renderable.color = color;
            renderable._transform.position = new Float32Array([x, y]);
            renderable._transform.scale = new Float32Array([w, h]);
            renderables.push(renderable);
        }
        return renderables;
    }
}
