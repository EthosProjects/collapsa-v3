/**
 * A function that converts a length of time in milliseconds into a string
 * @param {Number} t The length of the timer you're stringifying
 * @returns {String}
 */
const timerToString = (t) => {
    let cy = 365 * 24 * 60 * 60 * 1000,
        cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        cm = 60 * 1000,
        cs = 1000,
        y = Math.floor(t / cy),
        d = Math.floor((t - y * cy) / cd),
        h = Math.floor((t - y * cy - d * cd) / ch),
        m = Math.floor((t - y * cy - d * cd - h * ch) / cm),
        s = Math.floor((t - y * cy - d * cd - h * ch - m * cm) / cs),
        ms = Math.round(t - y * cy - d * cd - h * ch - m * cm - s * cs);
    let toReturn = '';
    if (y !== 0) {
        toReturn += d + ' year';
        if (y !== 1) toReturn += 's';
        if (t - y * cy !== 0) toReturn += ', ';
    }
    if (d !== 0) {
        toReturn += d + ' day';
        if (d !== 1) toReturn += 's';
        if (t - y * cy - d * cd !== 0) toReturn += ', ';
    }
    if (h !== 0) {
        toReturn += h + ' hour';
        if (h !== 1) toReturn += 's';
        if (m !== 0 || s !== 0 || ms !== 0) toReturn += ', ';
    }
    if (m !== 0) {
        toReturn += m + ' minute';
        if (m !== 1) toReturn += 's';
        if (s !== 0 || ms !== 0) toReturn += ', ';
    }
    if (s !== 0) {
        toReturn += s + ' second';
        if (s !== 1) toReturn += 's';
        if (ms !== 0) toReturn += ', and ';
    }
    if (ms !== 0) {
        toReturn += ms + ' millisecond';
        if (ms !== 1) toReturn += 's';
    }
    return toReturn;
};
export default timerToString;
