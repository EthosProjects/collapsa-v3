import { NativePlayer } from '../../native/export.js';
export default class Player {
    constructor() {
        NativePlayer.bindInstanceToNative(this);
    }
}
NativePlayer.bindClassToNative(Player);
