/**
 * @typedef Vector
 * @property {Number} x
 * @property {Number} y
 */
export default class Player {
    /**
     *
     * @param {Object} param0
     * @param {Vector} param0.position
     * @param {Vector} param0.velocity
     * @param {String} param0.username
     */
    constructor({ id, position, velocity, username }) {
        this.id = id;
        this.position = {
            x: position.x,
            y: position.y,
        };
        this.velocity = {
            x: velocity.x,
            y: velocity.y,
        };
        this.username = username;
    }
}
