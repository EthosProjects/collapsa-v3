import { util } from '../../remastered-lib/export.js';
const genSnowflake = util.genSnowflake;
export default class discorduserbaseUser {
    constructor(options) {
        this._id = options.id || genSnowflake(process.reqCount.toString(2), '2', '0');
        this.id = this._id;
        this.guilds = {};
        Object.assign(this, options);
        for (const prop in this.guilds) {
            let guild = Object.assign(
                {
                    muteTimeEnd: false,
                    banTimeEnd: false,
                    exp: {
                        amount: 0,
                        level: 0,
                    },
                    moderation: [],
                },
                this.guilds[prop],
            );
            guild.moderation = guild.moderation.map((w) =>
                Object.assign(
                    {
                        id: genSnowflake(process.reqCount.toString(2), '2', '0'),
                        type: 'DefaultType',
                        by: 'DefaultAuthor',
                        reason: 'DefaultReason',
                        time: new Date().getTime(),
                        removed: false,
                    },
                    w,
                ),
            );
            this.guilds[prop] = guild;
        }
    }
}
