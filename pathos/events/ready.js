import Event from '../Event.js';
import Bot from '../Bot.js';
export default new Event({
    name: 'ready',
    /**
     *
     */
    execute: async function () {
        /**
         * @type {Bot}
         */
        let client = this;
        client.user.setPresence({ activity: { name: 'Moderating' }, status: 'online' });
        console.log('Pathos is online');
        let collapsaIO = client.guilds.cache.get('859837419998412801');
        //let message = await colorRoles.send(e);
        //reaction.emoji.name == '🟦'*/
    },
});
