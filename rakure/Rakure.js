import Bot from '../pathos/Bot.js';
import fs from 'fs';
export default class RakureBot extends Bot {
    constructor() {
        super();
        this.guildInfo.id = '864579848222408724';
        this.guildInfo.roles.memberRoleID = '864595181700775976';
        this.guildInfo.roles.botRoleID = '864809022997135360';
        this.guildInfo.roles.mutedRoleID = '864794739677331458';
        this.guildInfo.channels.logsChannelID = '864594950527385620';
        this.guildInfo.channels.commandsChannelID = '864580204483444737';
        this.TOKEN = process.env.RAKURE_TOKEN;
    }
    async loadSpecialization() {
        const commandFolders = fs.readdirSync('./rakure/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./rakure/commands/${folder}`).filter((file) => file.endsWith('.js'));
            let folderArr = [];
            for (const file of commandFiles) {
                const { default: command } = await import(`./commands/${folder}/${file}`);
                this.commands.set(command.name, command);
                folderArr.push(command);
            }
            this.commandFolders.set(folder, folderArr);
        }
        const eventFiles = fs.readdirSync('./rakure/events');
        for (const file of eventFiles) {
            const { default: event } = await import(`./events/${file}`);
            this.on(event.name, function handleEvent() {
                event.execute(...arguments, this);
            });
        }
    }
}
