import { EventEmitter } from 'events';
import binding from 'bindings';
import { inherits } from 'util';
const native = binding('native_emitter');
const { NativeEmitter } = native;
console.log(NativeEmitter);
inherits(NativeEmitter, EventEmitter);
export default NativeEmitter;
