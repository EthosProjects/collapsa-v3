/*console.time('')
for(let i = 0; i < 50; i++){ 
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer, 0);
    view.setInt32(1, 42);
    view.getInt16(1);
}
for(let i = 0; i < 50; i++){ 
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer, 0);
    view.setInt32(1, 42);
    view.getInt16(1);
}*/
var littleEndian = (function () {
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    // Int16Array uses the platform's endianness.
    return new Int16Array(buffer)[0] === 256;
})();
console.log(littleEndian); // true or false
import { Reader as binaryReader, Writer as binaryWriter } from './shared/v3binlingo.js';
const writer = new binaryWriter('Basic String for parsing here'.length, false);
writer.packString('Basic string for parsing here');
const reader = new binaryReader(writer.arrayBuffer, writer.endianess, 0);
const len = writer.arrayBuffer.byteLength;
console.time('new');
for (let i = 0; i < 5000; i++) {
    reader.viewIndex = 0;
    reader.unpackString3(len);
}
console.timeEnd('new');
console.time('newest');
for (let i = 0; i < 5000; i++) {
    reader.viewIndex = 0;
    reader.unpackString4(len);
}
console.timeEnd('newest');
reader.viewIndex = 0;
console.log(reader.unpackString4(len));
