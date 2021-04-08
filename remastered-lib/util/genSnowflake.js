let zeroFill = (n, w) => {
    if (typeof n === 'bigint') {
        let endStr = '';
        for (let e = w - 1; e !== -1; e--) endStr += (n & BigInt(Math.pow(2, e))) >> BigInt(e);
        return endStr;
    }
    let endStr = '';
    for (let e = w - 1; e !== -1; e--) endStr += (n & Math.pow(2, e)) >> e;
    return endStr;
};
/**
 * Generates a snowflake
 * @param {Number} processID The ID of the current process
 * @param {Number} workerID The ID of the worker processing this request
 * @returns {String} A snowflake
 */
const genSnowflake = (processID, workerID) => {
    let timestamp = zeroFill(BigInt(new Date().getTime() - 1613122192045), 42),
        increment = zeroFill(process.reqCount, 12);
    processID = zeroFill(processID, 5);
    workerID = zeroFill(workerID, 5);
    return BigInt('0b' + timestamp + processID + workerID + increment, 2).toString();
};
export default genSnowflake;
