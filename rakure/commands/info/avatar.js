import { MessageEmbed, Message } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'avatar',
    arguments: [
        new Argument({
            _name: 'member',
            optional: true,
            type: 'Member',
            description: 'User ID, mention, or username of the member whom you want to get the avatar of',
        }),
    ],
    description: 'Get the avatar of yourself, or other users',
    botPermissions: ['SEND_MESSAGES'],
    /**
     * @param {Message} message
     */
    execute: async (message, args = [], client, mLab) => {
        let member = args[0] || message.member;
        let embed = new MessageEmbed()
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .setImage(member.user.displayAvatarURL({ dynamic: true, format: 'png' }) + '?size=1024')
            .setFooter(`Avatar of ${member.user.tag}`)
            .setTimestamp();
        client.sendMessage(message, embed);
    },
});
