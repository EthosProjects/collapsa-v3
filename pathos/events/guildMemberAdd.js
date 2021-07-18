import { GuildMember } from 'discord.js';
import Event from '../Event.js';
import { MessageEmbed } from 'discord.js';
export default new Event({
    name: 'guildMemberAdd',
    /**
     *
     * @param {GuildMember} member
     * @param {*} client
     * @returns
     */
    execute: async function (member) {
        let client = this;
        if (!client.loadRole('memberRole', client.guildInfo.roles.memberRoleID)) return;
        if (!client.loadRole('botRole', client.guildInfo.roles.botRoleID)) return;
        let memberRole = client.guildObjects.roles['memberRole'];
        let botRole = client.guildObjects.roles['botRole'];
        if (!member.user.bot && memberRole) member.roles.add(memberRole);
        else if (member.user.bot && botRole) member.roles.add(botRole);
        let embed = new MessageEmbed()
            .setTitle(`${member.user.tag}(${member.id}) joined`)
            .addField('Account creation', member.user.createdAt)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }) + '?size=128')
            .setTimestamp(member.joinedAt);
        client.sendToLogs(embed);
    },
});
