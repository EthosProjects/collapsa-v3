'use strict';
import { NativeEmitter } from './native/export.js';

const emitter = new NativeEmitter();
emitter.on('start', () => {
    console.log('### START ...');
});
emitter.on('data', (evt) => {
    console.log(evt);
});
emitter.on('end', () => {
    console.log('### END ###');
});
emitter.callAndEmit();
console.log('no wait');
