/**
 *
 * @param {Number} sides
 * @param {Number} size
 * @param {Number} x
 * @param {Number} y
 * @param {String} color
 * @param {CanvasRenderingContext2D} ctx
 */
let drawPolygonConvex = (sides, size, x, y, color, ctx) => {
    ctx.beginPath();
    ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

    for (var i = 1; i <= sides; i += 1) {
        ctx.lineTo(x + size * Math.cos((i * 2 * Math.PI) / sides), y + size * Math.sin((i * 2 * Math.PI) / sides));
    }

    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.restore();
};
/**
 *
 * @param {Number} sides
 * @param {Number} size
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 * @param {String} color
 * @param {CanvasRenderingContext2D} ctx
 */
let drawPolygonConcave = (sides, size, x, y, angle, color, ctx) => {
    ctx.beginPath();
    ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

    for (var i = 1; i <= sides; i += 1) {
        ctx.lineTo(
            x + size * Math.cos((i * 2 * angle * Math.PI) / sides),
            y + size * Math.sin((i * 2 * angle * Math.PI) / sides),
        );
    }
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.restore();
};
export { drawPolygonConvex, drawPolygonConcave };
