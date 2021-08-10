import { util } from '../../remastered-lib/export.js';
const { genSnowflake } = util;
export default class pathos_DiscordUser {
    constructor(options) {
        this._id = genSnowflake();
        Object.assign(this, options);
    }
}
