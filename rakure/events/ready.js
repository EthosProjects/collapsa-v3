import Event from '../../pathos/Event.js';
import { Client, Message, MessageEmbed } from 'discord.js';
export default new Event({
    name: 'ready',
    /**
     *
     */
    execute: async (client) => {
        client.user.setPresence({ activity: { name: 'Making your heart go doki-doki' }, status: 'idle' });
        console.log('Rakure-chan is online');
        let raku = client.guilds.cache.get('864579848222408724');
        let rules = raku.channels.cache.get('864581369089884170');
        let ruleList = [
            {
                title: '**1. Be civil.**',
                description: 'Harassment is not tolerated, and neither are racist or homophobic slurs.',
            },
            {
                title: '**2. Do not be toxic.**',
                description: 'If a moderator asks you to chill, then chill. This is a non-toxic server.',
            },
            {
                title: '**3. No advertising**',
                description: 'This includes posting invites in the server, DM advertising, and status advertising.',
            },
            {
                title: '**4. No NSFW at all**',
                description: 'This is an SFW server. There are 0 NSFW channels and none will be added.',
            },
            {
                title: '**5. Follow the Discord Terms of Service**',
                description: 'You must follow the TOS at all times. It can be found here: https://discord.com/terms',
            },
        ];
        /*
        let e = new MessageEmbed()
            .setTitle('Rules')
        for (let i = 0; i < ruleList.length; i++) e.addField(ruleList[i].title, ruleList[i].description)
        await rules.send(e);*/
        let colorRoles = raku.channels.cache.get('864853988856037447');
        let e = new MessageEmbed().setTitle('Color roles').setDescription('React below for a color role');
        /**
         * @type {Message}
         */
        //let message = await colorRoles.send(e);
        //reaction.emoji.name == '🟦'*/
    },
});
