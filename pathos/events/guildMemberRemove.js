import Event from '../../pathos/Event.js';
import { MessageEmbed } from 'discord.js';
export default new Event({
    name: 'guildMemberRemove',
    execute: async function (member) {
        let client = this;
        let embed = new MessageEmbed()
            .setTitle(`${member.user.tag}(${member.id}) left`)
            .addField('Account creation', member.user.createdAt)
            .addField('Joined date', member.joinedAt)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }) + '?size=128')
            .setTimestamp(new Date());
        client.sendToLogs(embed);
    },
});
