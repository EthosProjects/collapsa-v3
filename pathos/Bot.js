import { Client, Collection, Message, MessageEmbed, GuildMember, Intents, TextChannel, Role } from 'discord.js';
import Command from './Command.js';
import fs from 'fs';
import https from 'https';
export default class Bot extends Client {
    constructor() {
        const intents = new Intents([
            Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
            'GUILD_MEMBERS', // lets you request guild members (i.e. fixes the issue)
        ]);
        super({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], ws: { intents } });
        /**
         * @type {Collection<string,Command>}
         */
        this.commands = new Collection();
        /**
         * @type {Collection<string,Array.<Command>>}
         */
        this.commandFolders = new Collection();
        this.guildInfo = {
            id: '',
            roles: {
                memberRoleID: '',
                botRoleID: '',
                mutedRoleID: '',
            },
            channels: {
                logsChannelID: '',
                commandsChannelID: '',
            },
        };
        this.guildObjects = {
            /**
             * @type {Object.<string, Role>}
             */
            roles: {
                memberRole: null,
                botRole: null,
                mutedRole: null,
            },
            /**
             * @type {Object.<string, TextChannel>}
             */
            channels: {
                logsChannel: null,
                commandsChannel: null,
            },
        };
        this.TOKEN = '';
    }
    loadSpecialization() {
        throw new Error('Failed to overwrite');
    }
    async initialize() {
        await this.loadSpecialization();
        /*
        this.on('message', message => {
            if (!message.author.bot) return;
            if (message.author.id == '302050872383242240') {
                if(message.embeds[0] && message.embeds[0].description.match('Bump done')){
                    setTimeout(() => {
                        message.channel.send('<@&864818777979092993> Time to bump');
                    }, 2 * 60 * 60 * 1000);
                }
            }
        })*/
    }
    /**
     *
     * @param {Message} message
     * @param {string|MessageEmbed} toSend
     * @param {Boolean} reply
     */
    sendMessage(message, toSend, reply = false) {
        if (message.channel.permissionsFor(message.channel.guild.me).has('SEND_MESSAGES')) {
            if (reply) message.reply(toSend);
            else message.channel.send(toSend);
        }
    }
    /**
     *
     * @param {GuildMember} executor
     * @param {GuildMember} target
     */
    assertDominance(executor, target) {
        let executorRolesArr = [...executor.roles.cache.values()].map((role) => role.rawPosition).sort((a, b) => b - a);
        let targetRolesArr = [...target.roles.cache.values()].map((role) => role.rawPosition).sort((a, b) => b - a);
        if (executor.id == target.guild.ownerID) return true;
        if (target.id == target.guild.ownerID) return false;
        if (executorRolesArr[0] <= targetRolesArr[0]) return false;
        return true;
    }
    /**
     *
     * @param {string|MessageEmbed} toSend
     */
    async sendToLogs(toSend) {
        if (!this.loadChannel('logsChannel', this.guildInfo.channels.logsChannelID))
            return console.log('Failed to load logs channel');

        let logsChannel = this.guildObjects.channels.logsChannel;
        logsChannel.send(toSend);
    }
    loadChannel(channelName, channelID) {
        let channels = this.guildObjects.channels;
        if (channels[channelName] !== null) {
            if (channels[channelName].deleted) return false;
            else return true;
        }
        let guild = this.guilds.cache.get(this.guildInfo.id);
        if (!guild.channels.cache.has(channelID)) return false;
        channels[channelName] = guild.channels.cache.get(channelID);
        return true;
    }
    loadRole(roleName, roleID) {
        let roles = this.guildObjects.roles;
        if (roles[roleName] !== null) {
            if (roles[roleName].deleted) return false;
            else return true;
        }
        let guild = this.guilds.cache.get(this.guildInfo.id);
        if (!guild.roles.cache.has(roleID)) return false;
        roles[roleName] = guild.roles.cache.get(roleID);
        return true;
    }
}
