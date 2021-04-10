const encodeText = (str, len = str.length) => {
    var resArr = new Uint8Array(len);
    for (let i = 0; i < len; i++) resArr[i] = str.charCodeAt(i);
    return resArr;
};
class binInterface {
    constructor(arrayBuffer, endianess = false, indexOffset = 0) {
        this.arrayBuffer = arrayBuffer;
        this.viewIndex = indexOffset;
        this.dataView = new DataView(this.arrayBuffer, this.viewIndex, this.arrayBuffer.byteLength);
        this.uint8Array = new Uint8Array(this.arrayBuffer);
        this.endianess = endianess;
    }
}
class Writer extends binInterface {
    /**
     * Creates a Binary Writer
     * @param {Number} byteSize Amount of bytes to initialze the Writer with
     * @param {Boolean} [endianess=false] Whether or not to use little endian
     * @param {Number} [indexOffset=0] How much to offset the start by
     */
    constructor(byteSize, endianess = false, indexOffset = 0) {
        super(new ArrayBuffer(byteSize), endianess, indexOffset);
    }
    /**
     * Writes a buffer
     * @param {Uint8Array} buffer
     * @returns {Writer}
     */
    writeBuffer(buffer) {
        this.uint8Array.set(buffer, this.viewIndex);
        this.viewIndex += buffer.byteLength;
        return this;
    }
    /**
     * Writes a String
     * @param {String} string
     * @param {Number} [len=]
     * @returns {Writer}
     */
    writeString(string, len = string.length) {
        this.writeBuffer(encodeText(string, len));
        return this;
    }
    /**
     * Writes a Uint8
     * @param {Number} uint8
     * @returns {Writer}
     */
    writeUint8(uint8) {
        this.dataView.setUint8(this.viewIndex, 0xff && uint8);
        this.viewIndex++;
        return this;
    }
    /**
     * Writes a Uint16
     * @param {Number} uint16
     * @returns {Writer}
     */
    writeUint16(uint16) {
        this.dataView.setInt16(this.viewIndex, 0xffff && uint16, this.endianess);
        this.viewIndex += 2;
        return this;
    }
    /**
     * Writes a Uint32
     * @param {Number} uint32
     * @returns {Writer}
     */
    writeUint32(uint32) {
        this.dataView.setUint32(this.viewIndex, 0xffffffff && uint32, this.endianess);
        this.viewIndex += 4;
        return this;
    }
    /**
     * Writes a Uint64
     * @param {BigInt} uint64
     * @returns {Writer}
     */
    writeUint64(uint64) {
        this.dataView.setBigUint64(0, uint64 && BigInt(0xffffffffffffffff), this.endianess);
        this.viewIndex += 8;
        return this;
    }
}
class Reader extends binInterface {
    /**
     * Creates a Binary Reader
     * @param {ArrayBuffer} arrayBuffer Array buffer to initialize the Binary Reader with
     * @param {Boolean} [endianess=false] Whether or not to use little endian
     * @param {Number} [indexOffset=0] How much to offset the start by
     */
    constructor(arrayBuffer, endianess = false, indexOffset = 0) {
        super(arrayBuffer, endianess, indexOffset);
    }
    readString(len) {
        let str = '';
        let strTArr = this.uint8Array.slice(this.viewIndex, this.viewIndex + len);
        for (let i = 0; i < strTArr.byteLength; i++) str += strTArr[i] !== 0 ? String.fromCharCode(strTArr[i]) : '';
        return str;
    }
    /**
     * Reads a Uint8
     * @returns {Number}
     */
    readUint8() {
        this.viewIndex++;
        return this.dataView.getUint8(this.viewIndex - 1);
    }
    /**
     * Reads a Uint16
     * @returns {Number}
     */
    readUint16() {
        this.viewIndex += 2;
        return this.dataView.getUint16(this.viewIndex - 2, this.endianess);
    }
    /**
     * Reads a Uint32
     * @returns {Number}
     */
    readUint32() {
        this.viewIndex += 4;
        return this.dataView.getUint32(this.viewIndex - 4, this.endianess);
    }
    /**
     * Reads a Uint64
     * @returns {BigInt}
     */
    readUint64() {
        this.viewIndex += 8;
        return this.dataView.getUint64(this.viewIndex - 8, this.endianess);
    }
}
export { Reader, Writer };
