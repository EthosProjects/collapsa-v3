import Bot from './Bot.js';
import fs from 'fs';
export default class PathosBot extends Bot {
    constructor() {
        super();
        this.guildInfo.id = '859837419998412801';
        this.guildInfo.roles.memberRoleID = '864788849195221032';
        this.guildInfo.roles.botRoleID = '865028503689887794';
        this.guildInfo.roles.mutedRoleID = '865028701179740192';
        this.guildInfo.channels.logsChannelID = '865025990547341343';
        this.TOKEN = process.env.PATHOS_TOKEN;
    }
    async loadSpecialization() {
        const commandFolders = fs.readdirSync('./pathos/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./pathos/commands/${folder}`).filter((file) => file.endsWith('.js'));
            let folderArr = [];
            for (const file of commandFiles) {
                const { default: command } = await import(`./commands/${folder}/${file}`);
                this.commands.set(command.name, command);
                folderArr.push(command);
            }
            this.commandFolders.set(folder, folderArr);
        }
        const eventFiles = fs.readdirSync('./pathos/events');
        for (const file of eventFiles) {
            const { default: event } = await import(`./events/${file}`);
            this.on(event.name, event.execute);
        }
    }
}
