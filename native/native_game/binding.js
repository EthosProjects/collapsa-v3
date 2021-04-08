import { EventEmitter } from 'events';
import binding from 'bindings';
import { inherits } from 'util';
const nativeGame = binding('native_game');
export const { bindToClass, bindInstanceToNative } = nativeGame;
