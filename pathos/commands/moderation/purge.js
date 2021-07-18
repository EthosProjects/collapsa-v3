import { MessageEmbed, Message, Client, MessageManager } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'purge',
    arguments: [
        new Argument({
            _name: 'userid',
            optional: true,
            type: 'UserID',
            description: 'User to delete messages from',
        }),
        new Argument({
            _name: 'limit',
            optional: true,
            type: 'Amount',
            description: 'Amount of messages you want to delete',
            default: 10,
        }),
    ],
    description: 'Delete up to 100 messages at once',
    permissions: ['MANAGE_MESSAGES'],
    botPermissions: ['MANAGE_MESSAGES'],
    /**
     * @param {Message} message
     * @param {Array} args
     * @param {Client} client
     * @param {mlabInteractor} mLab
     */
    execute: async (message, args, client, mLab) => {
        let limit = args[1] < 101 ? args[1] : 100;
        await message.delete();
        let messages = await message.channel.messages.fetch({ limit });
        if (args[0]) messages = messages.filter((m) => m.author.id == args[0]);
        await message.channel.bulkDelete(messages);
        let authorUser = message.author;
        let embed = new MessageEmbed()
            .setColor('#9f00ad')
            .setTitle(`${message.member.id} purged ${messages.size} messages`)
            .addFields([{ name: 'Channel', value: message.channel.id, inline: true }])
            .setAuthor(`${authorUser.tag}`, authorUser.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setTimestamp(new Date());
        let m = await message.channel.send(embed);
        setTimeout(() => m.delete(), 5000);
        client.sendToLogs(embed);
    },
});
