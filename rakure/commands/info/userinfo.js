import { MessageEmbed, Message } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'userinfo',
    arguments: [
        new Argument({
            _name: 'member',
            optional: true,
            type: 'Member',
            description: 'User ID, mention, or username of the user whom you want to get info on',
        }),
    ],
    description: 'Get information on yourself or a user',
    botPermissions: ['SEND_MESSAGES'],
    /**
     * @param {Message} message
     */
    execute: async (message, args = [], client, mLab) => {
        let member = args[0] || message.member;
        let inline = true;
        const status = {
            online: '**Online**',
            idle: '**Idle**',
            dnd: '**Do not Disturb**',
            offline: '**Offline**',
        };
        let embed = new MessageEmbed()
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addField('**Full Username**', `**${member.user.username}**`, inline)
            .addField('**ID**', `**${member.user.id}**`, inline)
            .addField('**Nickname**', `${member.nickname != null ? `**${member.nickname}**` : '**None**'}`)
            .addField('**Status**', `${status[member.user.presence.status]}`)
            .addField(
                '**Playing**',
                `${member.user.presence.game ? `🎮 ${member.user.presence.game.name}**` : '**Nothing**'}`,
            )
            .addField(
                '**Roles**',
                `${
                    member.roles.cache
                        .filter((r) => r.id !== message.guild.id)
                        .map((rolee) => rolee.name)
                        .join(' **|** ') || '**❌ No Roles**'
                }`,
            )
            .addField('**Discord Account Created On**', `**${member.user.createdAt}**`)
            .setFooter(`Information about ${member.user.tag}`)
            .setTimestamp();
        message.channel.send(embed);
    },
});
