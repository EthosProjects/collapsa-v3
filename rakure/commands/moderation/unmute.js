import { MessageEmbed, Message, GuildMember } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'unmute',
    arguments: [
        new Argument({
            _name: 'member',
            optional: false,
            type: 'Member',
            description: 'User ID, mention, or username of the member whom you want to unmute',
        }),
        new Argument({
            _name: 'reason',
            optional: true,
            type: 'Reason',
            description: 'Reason for the unmute',
            default: 'None specified',
        }),
    ],
    description: 'Unmutes a user',
    permissions: ['MANAGE_ROLES'],
    botPermissions: ['MANAGE_ROLES'],
    /**
     * @param {Message} message
     * @param {Array.<string>} args
     * @param {CollapsaBot} client
     */
    execute: async (message, args = [], client, mLab) => {
        let { guild, author: authorUser } = message;
        let authorMember = guild.members.cache.get(authorUser) || (await guild.members.fetch(authorUser.id));
        let member = args[0];
        let reason = args[1];
        if (member === false) return;
        if (member.id === authorUser.id) return client.sendMessage(message, "You're. . . . . . .not muted. . . . . .");
        if (!client.loadRole('mutedRole', client.guildInfo.roles.mutedRoleID))
            return client.sendMessage(message, 'It seems that someone has deleted the muted role for this server.');
        let role = client.guildObjects.roles.mutedRole;
        await member.roles.remove(role);
        let embed = new MessageEmbed()
            .setColor('#000001')
            .setTitle(`${authorUser.tag}(${authorUser.id}) unmuted ${member.user.tag}(${member.id})`)
            .addFields([
                {
                    name: 'Reason',
                    value: reason ? reason : 'No reason specified',
                    inline: true,
                },
            ])
            .setAuthor(
                `${authorUser.username}#${authorUser.discriminator}`,
                authorUser.displayAvatarURL({ dynamic: true, format: 'png' }),
            )
            .setTimestamp(new Date());
        let m = await message.channel.send(embed);
        setTimeout(() => m.delete(), 5000);
        client.sendToLogs(embed);
    },
});
