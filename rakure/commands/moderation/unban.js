import { MessageEmbed, Message } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'unban',
    arguments: [
        new Argument({
            _name: 'user',
            nameStartsWithVowel: false,
            optional: false,
            type: 'UserID',
            description: 'User ID, mention, or username of the user whom you want unban',
        }),
        new Argument({
            _name: 'reason',
            nameStartsWithVowel: false,
            optional: true,
            type: 'Reason',
            description: 'Reason for unbanning this user',
        }),
    ],
    description: 'Unbans a user',
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
        let userID = args[0];
        let reason = args[1];
        if (userID === false) return;
        if (guild.members.cache.has(userID)) message.channel.send('This user is not banned');
        if (userID === message.author.id) return client.sendMessage(message.channel, "You aren't banned");
        guild.members.unban(user).then(
            async (res) => {
                let embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`${authorUser.tag}(${authorUser.id}) unbanned ${member.user.tag}(${member.id})`)
                    .addField('Reason', reason)
                    .setAuthor(
                        `${authorUser.username}#${authorUser.discriminator}`,
                        authorUser.displayAvatarURL({ dynamic: true, format: 'png' }),
                    )
                    .setTimestamp();
                let m = await message.channel.send(embed);
                setTimeout(() => m.delete(), 5000);
                client.sendToLogs(embed);
            },
            async (err) => {
                let embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`${authorUser.tag}(${authorUser.id}) failed to unban ${member.user.tag}(${member.id})`)
                    .addField('Reason', err.message)
                    .setAuthor(
                        `${authorUser.username}#${authorUser.discriminator}`,
                        authorUser.displayAvatarURL({ dynamic: true, format: 'png' }),
                    )
                    .setTimestamp();
                let m = await message.channel.send(embed);
                setTimeout(() => m.delete(), 5000);
                client.sendToLogs(embed);
            },
        );
    },
});
