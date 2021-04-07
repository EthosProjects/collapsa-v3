import { util } from '../../remastered-lib/export.js';
const genSnowflake = util.genSnowflake;
export default class collapsauserbaseUser {
    constructor(options) {
        this._id = options.id || genSnowflake(process.reqCount.toString(2), '2', '0');
        this.id = this._id;
        this.token = 'Aph_Default';
        this.username = 'DefaultUsername';
        this.email = 'Default@email.com';
        this.authorization = 1;
        this.discordid = false;
        this.highscore = 0;
        this.collapsaCoins = 0;
        Object.assign(this, options);
    }
    get public() {
        return {
            id: this.id,
            discordid: this.discordid ? this.discordid : undefined,
            username: this.username,
            highscore: this.highscore,
        };
    }
    get private() {
        return {
            id: this.id,
            username: this.username,
            highscore: this.highscore,
            token: this.token,
            email: this.email,
            discordid: this.discordid,
        };
    }
}
