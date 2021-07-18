import { GuildMember, TextChannel } from 'discord.js';
import Event from '../../pathos/Event.js';
import { MessageEmbed } from 'discord.js';
export default new Event({
    name: 'guildMemberAdd',
    /**
     *
     * @param {GuildMember} member
     * @param {*} client
     * @returns
     */
    execute: async (member, client) => {
        if (!client.loadRole('memberRole', client.guildInfo.roles.memberRoleID))
            return console.log('Failed to load member role');
        if (!client.loadRole('botRole', client.guildInfo.roles.botRoleID))
            return console.log('Failed to load bot role');
        let memberRole = client.guildObjects.roles['memberRole'];
        let botRole = client.guildObjects.roles['botRole'];
        if (!member.user.bot && memberRole) member.roles.add(memberRole);
        else if (member.user.bot && botRole) member.roles.add(botRole);
        let embed = new MessageEmbed()
            .setTitle(`${member.user.tag}(${member.id}) joined`)
            .addField('Account creation', member.user.createdAt)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }) + '?size=128')
            .setTimestamp(member.joinedAt);
        client.sendToLogs(embed);
        if (!member.guild.channels.cache.has('864579848222408727')) return;
        /**
         * @type {TextChannel}
         */
        let welcomeChannel = member.guild.channels.cache.get('864579848222408727');
        embed = new MessageEmbed()
            .setTitle('Welcome to the server')
            .setDescription(`Make sure you read the <#864581369089884170> and get a color in <#864853988856037447>`)
            .setThumbnail(member.user.displayAvatarURL());
        welcomeChannel.send(`<@${member.id}>`, { embed });
    },
});
