import { Message, Util, MessageEmbed } from 'discord.js';
import Event from '../../pathos/Event.js';
export default new Event({
    name: 'messageDelete',
    /**
     * @type {Message}
     */
    execute: async function (message) {
        if (message.partial) return;
        if (!message.guild) return;
        if (message.channel.id == this.guildInfo.channels.logsChannelID) return;
        if (message.author.bot) return;
        // Add latency as audit logs aren't instantly updated, adding a higher latency will result in slower logs, but higher accuracy.
        await Util.delayFor(900);
        // Fetch a couple audit logs than just one as new entries could've been added right after this event was emitted.
        const fetchedLogs = await message.guild
            .fetchAuditLogs({
                limit: 6,
                type: 'MESSAGE_DELETE',
            })
            .catch(() => ({
                entries: [],
            }));
        const auditEntry = fetchedLogs.entries.find(
            (a) =>
                // Small filter function to make use of the little discord provides to narrow down the correct audit entry.
                a.target.id === message.author.id &&
                a.extra.channel.id === message.channel.id &&
                // Ignore entries that are older than 20 seconds to reduce false positives.
                Date.now() - a.createdTimestamp < 20000,
        );
        // Finally, prepare the embed and send the log.
        const embed = new MessageEmbed()
            .setTitle(
                `${auditEntry ? auditEntry.executor.tag + ' d' : 'D'}eleted message(${message.id}) by ${
                    message.author.tag
                }(${message.author.id})`,
            )
            .setColor('#fc3c3c')
            .addField('Channel', message.channel, true)
            .addField('Message', message.content || 'None')
            .setTimestamp(auditEntry ? auditEntry.createdTimestamp : new Date());
        this.sendToLogs(embed);
    },
});
