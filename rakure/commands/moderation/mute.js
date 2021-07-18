import { MessageEmbed, Message, GuildMember } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'mute',
    arguments: [
        new Argument({
            _name: 'member',
            optional: false,
            type: 'Member',
            description: 'User ID, mention, or username of the member whom you want to mute',
        }),
        new Argument({
            _name: 'time',
            optional: true,
            type: 'Time',
            description: 'Length of the mute',
            default: 60_000_000,
        }),
        new Argument({
            _name: 'reason',
            optional: true,
            type: 'Reason',
            description: 'Reason for the mute',
            default: 'None specified',
        }),
    ],
    permissions: ['MANAGE_ROLES'],
    botPermissions: ['MANAGE_ROLES'],
    description: 'Mutes a user',
    /**
     * @param {Message} message
     * @param {[GuildMember, Number, String]} args
     * @param {CollapsaBot} client
     * @param {mlabInteractor} mLab
     */
    execute: async (message, args = [], client, mLab) => {
        let currTime = new Date();
        let t = args[1];
        let endTime = currTime.getTime() + t;
        function dhm(t) {
            console.log(cd);
            var cd = 24 * 60 * 60 * 1000,
                ch = 60 * 60 * 1000,
                d = Math.floor(t / cd),
                h = Math.floor((t - d * cd) / ch),
                m = Math.floor((t - d * cd - h * ch) / 60000),
                s = Math.round((t - d * cd - h * ch - m * 60000) / 1000),
                pad = function (n) {
                    return n < 10 ? '0' + n : n;
                };
            if (s === 60) {
                m++;
                s = 0;
            }
            if (m === 60) {
                h++;
                m = 0;
            }
            if (h === 24) {
                d++;
                h = 0;
            }
            return (
                (d ? d + ` Day${d > 1 ? 's' : ''} ` : '') +
                (h ? h + ` Hour${h > 1 ? 's' : ''} ` : '') +
                (m ? m + ` Minute${m > 1 ? 's' : ''} ` : '') +
                s +
                ` Second${s != 1 ? 's' : ''}`
            );
        }
        let { guild, author: authorUser } = message;
        let authorMember = guild.members.cache.get(authorUser) || (await guild.members.fetch(authorUser.id));
        let member = args[0];
        let reason = args[2];
        if (member === false) return;
        if (member.id === message.author.id) return client.sendMessage(message, "You can't mute yourself");
        // Check if a reason has been given by the message author
        if (!client.assertDominance(authorMember, member))
            return client.sendMessage(message, "You can't mute this user your role is not high enough", true);
        if (!client.loadRole('mutedRole', client.guildInfo.roles.mutedRoleID))
            return client.sendMessage(message, 'It seems that someone has deleted the muted role for this server.');
        let role = client.guildObjects.roles.mutedRole;
        await member.roles.add(role);
        setTimeout(() => {
            if (!guild.members.cache.get(member.id)) return;
            member.roles.remove(role);
        }, t);
        let embed = new MessageEmbed()
            .setColor('#000001')
            .setTitle(`${authorUser.tag}(${authorUser.id}) muted ${member.user.tag}(${member.id})`)
            .addFields([
                { name: 'Reason', value: reason, inline: true },
                { name: 'Time', value: dhm(t), inline: true },
            ])
            .setAuthor(`${authorUser.tag}`, authorUser.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setTimestamp(new Date());
        let m = await message.channel.send(embed);
        setTimeout(() => m.delete(), 5000);
        client.sendToLogs(embed);
    },
});
