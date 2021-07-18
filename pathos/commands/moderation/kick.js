import { MessageEmbed, Message, GuildMember } from 'discord.js';
import Command from '../../Command.js';
import Argument from '../../Argument.js';
export default new Command({
    name: 'kick',
    arguments: [
        new Argument({
            _name: 'member',
            optional: false,
            type: 'Member',
            description: 'User ID, mention, or username of the member whom you want to kick',
        }),
        new Argument({
            _name: 'reason',
            optional: true,
            type: 'Reason',
            description: 'Reason for the kick',
            default: 'None specified',
        }),
    ],
    description: 'Kicks a user',
    permissions: ['KICK_MEMBERS'],
    botPermissions: ['KICK_MEMBERS'],
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
        if (!(member instanceof GuildMember)) return;
        if (member.id === authorUser.id) return client.sendMessage(message, "You can't kick yourself");
        if (!client.assertDominance(authorMember, member))
            return client.sendMessage(message, "You can't kick this user your role is not high enough", true);
        if (!member.kickable)
            return client.sendMessage(
                message,
                "You can't kick this user because the bot does not have sufficient permissions!",
                true,
            );
        // Check if the user is kickable with the bot's permissions
        await member.kick(); // Kicks the user
        let embed = new MessageEmbed()
            .setColor('purple')
            .setTitle(`${authorUser.tag}(${authorUser.id}) kicked ${member.user.tag}(${member.id})`)
            .addField('Reason', reason)
            .setAuthor(`${authorUser.tag}`, authorUser.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setTimestamp(new Date());
        let m = await message.channel.send(embed);
        setTimeout(() => m.delete(), 5000);
        client.sendToLogs(embed);
    },
});
