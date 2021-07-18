import Argument from './Argument.js';
import { Message } from 'discord.js';
import Bot from './Bot.js';
export default class Command {
    constructor(options) {
        this.name = Math.random().toString(16);
        /**
         * @type {Array.<Argument>}
         */
        this.arguments = [];
        this.description = 'Default command description';
        this.permissions = ['SEND_MESSAGES'];
        this.botPermissions = [];
        this.nsfw = false;
        /**
         * @param {Message} message
         * @param {Array.<string>} args
         * @param {Bot} client
         */
        this.resolveArguments = async (message, args, client) => {
            let resolvedArgs = new Array(this.arguments.length);
            /**
            ['<@21321432412412>', '10s', 'REASON']
            ['User', 'Time', 'REASON']
            ['<@21321432412412>', 'REASON']
            ['User', 'Time', 'REASON']
            [0, 1, 2]
             * [ , , ]
             * Step 1
             * i = 0
             * We resolve the user
             * [ User, , ]
             * Move on
             * Step 2
             * i = 1
             * We cannot Resolve a time
             * [ User, DefaultTime, ]
             * Index of psuedo Argument becomes 2
             * Index of true argument stays as 1
             * reason is args[1] and beyond, instead of args[2] and beyond
             */
            let argIndex = 0;
            for (let i = 0; i < this.arguments.length; i++) {
                let arg = this.arguments[i];
                let currArg = args[argIndex];
                if (!arg.optional && !currArg) {
                    message.reply(`You must specify ${arg.text}`);
                    resolvedArgs.failed = true;
                    return resolvedArgs;
                }
                let resolveTime = (argument) => {
                    let arg = args[argIndex];
                    let times = ['m', 'h', 'd', 's'];
                    let timeRegex = new RegExp(`^\\d+(${times.reduce((a, b) => `${a}|${b}`)})$`);
                    let timeReplaceRegex = new RegExp(`(${times.reduce((a, b) => `${a}|${b}`)})$`);
                    if (arg.match(timeRegex)) {
                        let timeRegexes = times.map((t) => new RegExp(t));
                        let time = times[timeRegexes.findIndex((t) => arg.match(t))];
                        let t = parseInt(arg.replace(timeReplaceRegex, '')) * 1000;
                        if (time != 's') t *= 60;
                        if (time == 'h') t *= 60;
                        if (time == 'd') t *= 60 * 24;
                        return t;
                    } else return false;
                };
                let resolveUser = (arg) => {
                    let userID;
                    let initialResolve = (arg) => {
                        if (args[argIndex].match(/^\d{16,18}$/)) userID = args[argIndex];
                        else if (args[argIndex].match(/^<@!{0,1}\d{16,18}>$/)) {
                            userID = args[argIndex].replace(/^<@!{0,1}/, '').replace(/>$/, '');
                        } else if (
                            message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            )
                        ) {
                            userID = message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            ).user.id;
                        } else userID = false;
                        if (userID) {
                            let user = client.users.cache.get(userID);
                            if (user) {
                                return user;
                            } else return false;
                        } else return false;
                    };
                    return initialResolve(arg + '');
                };
                let resolveMember = async (arg) => {
                    let userID;
                    let initialResolve = async (arg) => {
                        if (args[argIndex].match(/^\d{16,18}$/)) {
                            userID = args[argIndex];
                        } else if (args[argIndex].match(/^<@!{0,1}\d{16,18}>$/)) {
                            userID = args[argIndex].replace(/^<@!{0,1}/, '').replace(/>$/, '');
                        } else if (
                            message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            )
                        ) {
                            userID = message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            ).user.id;
                        } else userID = false;
                        if (userID) {
                            let user =
                                message.guild.members.cache.get(userID) || (await message.guild.members.fetch(userID));
                            if (user) {
                                return user;
                            } else return false;
                        } else return false;
                    };
                    return await initialResolve(arg + '');
                };
                let resolveRole = (arg) => {
                    let roleID;
                    let initialResolve = (arg) => {
                        if (args[argIndex].match(/^\d{16,18}$/)) roleID = args[argIndex];
                        else if (args[argIndex].match(/^<&@\d{16,18}>$/)) {
                            roleID = args[argIndex].replace(/^<&@/, '').replace(/>$/, '');
                        } else if (message.guild.roles.cache.find((role) => role.name == args[argIndex])) {
                            roleID = message.guild.roles.cache.find((role) => role.name == args[argIndex]).id;
                        } else roleID = false;
                        if (roleID) {
                            let role = message.guild.roles.cache.get(roleID);
                            if (user) return role;
                            else return false;
                        } else return false;
                    };
                    return initialResolve(arg + '');
                };
                let resolveUserID = (arg) => {
                    let userID;
                    let initialResolve = (arg) => {
                        if (args[argIndex].match(/^\d{16,18}$/)) userID = args[argIndex];
                        else if (args[argIndex].match(/^<@!{0,1}\d{16,18}>$/)) {
                            userID = args[argIndex].replace(/^<@!{0,1}/, '').replace(/>$/, '');
                        } else if (
                            message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            )
                        ) {
                            userID = message.guild.members.cache.find(
                                (member) => member.nickname == args[argIndex] || member.user.username == args[argIndex],
                            ).user.id;
                        } else userID = false;
                        if (userID) return userID;
                        else return false;
                    };
                    return initialResolve(arg + '');
                };
                let resolveReason = (arg) => {
                    for (let c = 0; c < argIndex; c++) {
                        args.shift();
                    }
                    return args.join(' ');
                };
                let resolveAmount = (arg) => {
                    for (let c = 0; c < argIndex; c++) {
                        args.shift();
                    }
                    return args.join(' ');
                };
                let resolveEmoji = (arg) => {
                    let emojiRegex = /^<:[a-zA-Z0-9_]{2,32}:\d{16,18}>$/;
                    if (!args[argIndex].match(emojiRegex)) return false;
                    let id = args[argIndex].replace(/<:[a-zA-Z0-9_]{2,32}:/, '').replace(/>/, '');
                    let emoji = client.emojis.cache.get(id);
                    if (emoji) return emoji;
                    else return false;
                };
                let resolveEmojiID = (arg) => {
                    let emojiRegex = /^(<:[a-zA-Z0-9_]{2,32}:\d{16,18}>|\d{16,18})$/;
                    if (!args[argIndex].match(emojiRegex)) return false;
                    let id = args[argIndex].replace(/<:[a-zA-Z0-9_]{2,32}:/, '').replace(/>/, '');
                    return id;
                };
                let resolveCommandName = (argument) => {
                    if (client.commands.has(currArg)) {
                        return client.commands.get(currArg);
                    } else return false;
                };
                let resolveArgumentName = (argument) => {
                    let previousArg = args[argIndex - 1];
                    if (client.commands.has(previousArg)) {
                        let command = client.commands.get(previousArg);
                        if (command.arguments.find((argument) => argument._name == currArg))
                            return command.arguments.find((argument) => argument._name == currArg);
                        else return false;
                    } else return false;
                };
                /**
                 *
                 * @param {Argument} argument psuedoArgument
                 */
                let resolveArgument = async (argument) => {
                    if (!currArg) {
                        if (argument.type == 'Time') return (resolvedArgs[i] = 60 * 60 * 1000);
                        if (argument.type == 'Reason') return (resolvedArgs[i] = '');
                        return (resolvedArgs[i] = false);
                    }
                    let resolvedArgument = false;
                    if (argument.type == 'ArgumentName') resolvedArgument = resolveArgumentName(argument);
                    else if (argument.type == 'CommandName') resolvedArgument = resolveCommandName(argument);
                    else if (argument.type == 'User') resolvedArgument = resolveUser(argument);
                    else if (argument.type == 'UserID') resolvedArgument = resolveUserID(argument);
                    else if (argument.type == 'Emoji') resolvedArgument = resolveEmoji();
                    else if (argument.type == 'EmojiID') resolvedArgument = resolveEmojiID();
                    else if (argument.type == 'Member') resolvedArgument = await resolveMember(argument);
                    else if (argument.type == 'Role') resolvedArgument = resolveRole(argument);
                    else if (argument.type == 'Time') resolvedArgument = resolveTime(argument);
                    else if (argument.type == 'Reason') resolvedArgument = resolveReason();
                    else if (argument.type == 'Amount') resolvedArgument = resolveAmount();
                    else resolvedArgs[i] = args[argIndex];

                    if (resolvedArgument == false) {
                        resolvedArgs[i] = argument.default;
                        argIndex--;
                    } else resolvedArgs[i] = resolvedArgument;
                };
                await resolveArgument(arg);
                argIndex++;
            }
            return resolvedArgs;
        };
        this.execute = (message) => {
            message.channel.send('This command has not been set up :(');
        };
        Object.assign(this, options);
    }
}
