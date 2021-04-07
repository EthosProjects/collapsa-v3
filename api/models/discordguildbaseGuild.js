import { util } from '../../remastered-lib/export.js';
const genSnowflake = util.genSnowflake;
export default class discordguildbaseGuild {
    constructor(options) {
        this._id = options.id || genSnowflake(process.reqCount.toString(2), '2', '0');
        this.id = this._id;
        this.mute = {
            role: false,
        };
        this.moderation = {
            channel: false,
        };
        this.welcome = {
            channel: false,
            role: false,
        };
        Object.assign(this, options);
    }
}
