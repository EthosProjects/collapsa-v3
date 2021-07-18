import { MessageReaction, User } from 'discord.js';
import Event from '../../pathos/Event.js';
export default new Event({
    name: 'messageReactionAdd',
    /**
     *
     * @param {MessageReaction} reaction
     * @param {User} user
     * @returns
     */
    execute: async (reaction, user, client) => {
        if (user.bot) return;
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                return console.error('Something went wrong when fetching the message: ', error);
            }
            // Return as `reaction.message.author` may be undefined/null
        }
        if (reaction.message.channel.id == '864853988856037447' && reaction.message.id == '864874741637709844') {
            let roles = new Map([
                ['🟦', '864857477425528842'],
                ['🟩', '864881782876667924'],
                ['🟨', '864881773125304351'],
                ['🟧', '864881779981549599'],
                ['🟪', '864881763881058324'],
                ['🟥', '864881777074765855'],
            ]);
            if (roles.has(reaction.emoji.name)) {
                let id = roles.get(reaction.emoji.name);
                let guild = reaction.message.guild;
                let member =
                    guild.members.cache.get(user.id) ||
                    (await guild.members.fetch(user.id).catch((e) => console.error));
                if (!member) return;
                let role = guild.roles.cache.get(id);
                let mRoles = member.roles;
                if (mRoles.cache.has(id)) mRoles.remove(role).catch((e) => console.error);
                else {
                    let roleIDs = [...roles.values()];
                    for (let i = 0; i < roleIDs.length; i++)
                        if (mRoles.cache.has(roleIDs[i]))
                            mRoles.remove(guild.roles.cache.get(roleIDs[i])).catch((e) => console.error);
                    mRoles.add(role).catch((e) => console.error);
                }
                reaction.users.remove(user).catch((e) => console.error);
            }
        }
    },
});
