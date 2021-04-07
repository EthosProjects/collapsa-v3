export const formFormat = (data) =>
    Object.keys(data)
        .map((k) => `${k}=${encodeURIComponent(data[k])}`)
        .join('&');
export { default as genSnowflake } from './genSnowflake.js';
export { default as getArrayChange } from './getArrayChange.js';
export const JSONtoString = (obj, currIndent = 1, depthLimit = 15) => {
    if (Array.isArray(obj)) {
        let ret = '[\r\n',
            endRet = ']';
        if (obj.toString().length - (currIndent - 1) * 4 < 80) {
            ret = '[ ';
            endRet = ' ]';
            for (let i = 0; i < obj.length; i++) {
                ret += obj[i];
                if (i !== obj.length - 1) ret += ', ';
            }
            return ret + endRet;
        }
        let makeLine = (obj, prop, indentTimes) => {
            if (indentTimes > depthLimit) return new Array(indentTimes).fill('    ').join('') + 'Too Deep,\r\n';
            let str =
                new Array(indentTimes).fill('    ').join('') +
                `${
                    typeof obj[prop] == 'object' ? JSONtoString(obj[prop], indentTimes + 1) : obj[prop]
                },\r\n`;
            return str;
        };
        for (const prop in obj) {
            ret += makeLine(obj, prop, currIndent);
        }
        return ret + new Array(currIndent - 1).fill('    ').join('') + endRet;
    } else {
        let ret = '{\r\n';
        let makeLine = (obj, prop, indentTimes) => {
            if (indentTimes > depthLimit) return new Array(indentTimes).fill('    ').join('') + 'Too Deep,\r\n';
            let str =
                new Array(indentTimes).fill('    ').join('') +
                `${prop}: ${
                    typeof obj[prop] == 'object' ? JSONtoString(obj[prop], indentTimes + 1) : obj[prop]
                },\r\n`;
            return str;
        };
        for (const prop in obj) {
            ret += makeLine(obj, prop, currIndent);
        }
        return ret + new Array(currIndent - 1).fill('    ').join('') + '}';
    }
};
export { default as LeaderboardMethods } from './LeaderboardMethods.js';
export { default as StorageMethods } from './StorageMethods.js';
export { default as timerToString } from './timerToString.js';
export const toLiteral = (obj) => JSON.parse(JSON.stringify(obj));
