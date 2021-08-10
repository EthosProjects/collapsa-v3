import Renderable from '../../Engine/Renderables/Renderable.js';
import TextureRenderable from '../../Engine/Renderables/TextureRenderable.js';
import Camera from '../../Engine/Camera.js';
import { vec2 } from '../../lib/index.js';
export default class SceneFileParser {
    constructor(sceneFilePath) {
        /**
         * @type {Document}
         */
        this.mSceneXml = gEngine.ResourceMap.retrieveAsset(sceneFilePath);
    }
    /**
     * Retrieves all elements of a specific tag
     * @param {string} tagName The name of the tag
     * @returns {HTMLCollectionOf<Element>} All elements with that tag name
     */
    _getElementsByTagName(tagName) {
        let elements = this.mSceneXml.getElementsByTagName(tagName);
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
        cam.setBackgroundColor(bgColor);
        return cam;
    }
    parseSquares(sqSet) {
        let elements = this._getElementsByTagName('Square');
        let x, y, w, h, r, c, sq;
        for (let i = 0; i < elements.length; i++) {
            x = Number(elements.item(i).attributes.getNamedItem('PosX').value);
            y = Number(elements.item(i).attributes.getNamedItem('PosY').value);
            w = Number(elements.item(i).attributes.getNamedItem('Width').value);
            h = Number(elements.item(i).attributes.getNamedItem('Height').value);
            r = Number(elements.item(i).attributes.getNamedItem('Rotation').value);
            c = elements.item(i).attributes.getNamedItem('Color').value.split(' ');
            sq = new Renderable();
            // make sure color array contains numbers
            for (let j = 0; j < 3; j++) c[j] = Number(c[j]);
            sq.setColor(c);
            sq.getXform().setPosition(x, y);
            sq.getXform().setRotationInDegree(r); // In Radian
            sq.getXform().setSize(w, h);
            sqSet.push(sq);
        }
    }
    parseTextureSquares(sqSet) {
        var elm = this._getElementsByTagName('TextureSquare');
        var i, j, x, y, w, h, r, c, t, sq, i;
        for (i = 0; i < elm.length; i++) {
            x = Number(elm.item(i).attributes.getNamedItem('PosX').value);
            y = Number(elm.item(i).attributes.getNamedItem('PosY').value);
            w = Number(elm.item(i).attributes.getNamedItem('Width').value);
            h = Number(elm.item(i).attributes.getNamedItem('Height').value);
            r = Number(elm.item(i).attributes.getNamedItem('Rotation').value);
            c = elm.item(i).attributes.getNamedItem('Color').value.split(' ');
            t = elm.item(i).attributes.getNamedItem('Texture').value;
            sq = new TextureRenderable(t);
            // make sure color array contains numbers
            for (j = 0; j < 4; j++) c[j] = Number(c[j]);
            sq.setColor(c);
            sq.getXform().setPosition(x, y);
            sq.getXform().setRotationInDegree(r); // In Degree
            sq.getXform().setSize(w, h);
            sqSet.push(sq);
        }
    }
}
