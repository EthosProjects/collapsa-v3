import { MessageEmbed, Message } from 'discord.js';
import Command from '../../../pathos/Command.js';
import Argument from '../../../pathos/Argument.js';
export default new Command({
    name: 'help',
    description: 'Get a list of commands',
    arguments: [
        new Argument({
            _name: 'command',
            optional: true,
            type: 'CommandName',
            description: 'Command to get information on',
        }),
        new Argument({
            _name: 'argument',
            optional: true,
            type: 'ArgumentName',
            description: 'Argument to get information on',
        }),
    ],
    botPermissions: ['SEND_MESSAGES'],
    /**
     * @param {Message} message
     * @param {Array.<string>} args
     * @param {CollapsaBot} client
     * @param {mlabInteractor} mLab
     */

    execute: async (message, args = [], client, mLab) => {
        let embed = new MessageEmbed();
        let command = args[0];
        let argument = args[1];
        if (!command || (!message.channel.nsfw && command.nsfw)) {
            embed.setTitle('Command Information');
            client.commandFolders.forEach((commands, name) => {
                commands = commands.filter((c) => message.channel.nsfw || !c.nsfw);
                if (!commands.length) return;
                let firstCommand = commands.shift();
                let commandList = commands.reduce((a, b) => `${a} ${b.name}`, firstCommand.name);
                commands.unshift(firstCommand);
                embed.addField(name, commandList);
            });
            client.sendMessage(message, embed);
            client.sendMessage(message, 'Use `!help commandname` to get information on a specific command');
            return;
        } else if (!argument) {
            embed.setTitle(`Information about ${command.name}`);
            embed.setDescription(command.description);
            let firstArugment = command.arguments.shift();
            let argumentList = firstArugment
                ? command.arguments.reduce((a, b) => `${a} <${b.name}>`, `<${firstArugment.name}>`)
                : '';
            command.arguments.unshift(firstArugment);
            embed.addField('Usage', `!${command.name} ${argumentList}`);
            let roles = message.guild.roles.cache
                .filter((role) => role.permissions.has(command.permissions))
                .array()
                .map((role) => role.toString())
                .join(' ');
            embed.addField('Roles', roles.startsWith('@everyone') ? '@everyone' : roles);
            client.sendMessage(message, embed);
            client.sendMessage(
                message,
                'Use `' + `!help ${command.name} argumentname` + '` to get information on a specific argument',
            );
        } else {
            embed.setTitle(`Information about ${argument.name} in ${command.name}`);
            embed.setDescription(argument.description);
            embed.addField('Optional', argument.optional, true);
            embed.addField('Type', argument.type, true);
            client.sendMessage(message, embed);
        }
    },
});
