import { Message } from 'discord.js';
import Event from '../Event.js';
export default new Event({
    name: 'message',
    /**
     *
     * @param {Message} message
     * @returns
     */
    execute: async function (message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.partial) return;
        let prefixRegex = new RegExp(`^(<@!{0,1}${this.user.id}> |!)`);
        let { member, content, guild } = message;
        if (!content.match(prefixRegex)) return;
        let args = content.replace(prefixRegex, '').split(/ +/);
        const commandName = args.shift().toLowerCase();
        if (!this.commands.has(commandName)) return;
        let command = this.commands.get(commandName);
        /*
        let fluidCommands = ['nhentai', 'eval'];
        if (!fluidCommands.find((c) => c == commandName)) */
        args = await command.resolveArguments(message, args, this);
        if (!member.hasPermission(command.permissions))
            return mesage.reply(`You don't have permission to use this command`);
        if (!guild.me.hasPermission(command.botPermissions))
            return message.reply(`I don't have permission to use this command`);
        if (args.failed) return;
        command.execute(message, args, this);
    },
});
