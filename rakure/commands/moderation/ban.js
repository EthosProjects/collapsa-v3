import { MessageEmbed, Message } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'ban',
    arguments: [
        new Argument({
            _name: 'member',
            optional: false,
            type: 'Member',
            description: 'User ID, mention, or username of the member whom you want to ban',
        }),
        new Argument({
            _name: 'reason',
            optional: true,
            type: 'Reason',
            description: 'Reason for the ban',
        }),
    ],
    description: 'Bans a user',
    permissions: ['BAN_MEMBERS'],
    botPermissions: ['BAN_MEMBERS'],
    /**
     * @param {Message} message
     * @param {Array.<string>} args
     * @param {CollapsaBot} client
     * @param {mlabInteractor} mLab
     */
    execute: async (message, args = [], client, mLab) => {
        let { guild, author: authorUser } = message;
        let authorMember = guild.members.cache.get(authorUser) || (await guild.members.fetch(authorUser.id));
        let member = args[0];
        let reason = args[1];
        if (member === false) return;
        if (!reason) reason = 'No reason specified';
        if (member.id === authorUser.id) return client.sendMessage(message, "You can't ban yourself", true);
        if (!client.assertDominance(authorMember, member))
            return client.sendMessage(message, "You can't ban this user your role is not high enough", true);
        if (!member.bannable)
            return client.sendMessage(
                message,
                "You can't ban this user because the bot doesn't have sufficient pemissions",
                true,
            );
        if (guild.ownerID == member.id)
            return client.sendMessage(message, "You can't ban this user because they own the server", true);
        if (member.id == client.owner)
            return client.sendMessage(message, "I shan't ban my master. Do it yourself.", true);
        await member.ban();
        let embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(`${authorUser.tag}(${authorUser.id}) banned ${member.user.tag}(${member.id})`)
            .addField('Reason', reason)
            .setAuthor(`${authorUser.tag}`, authorUser.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setTimestamp(new Date());
        let m = await message.channel.send(embed);
        setTimeout(() => m.delete(), 5000);
        client.sendToLogs(embed);
    },
});
