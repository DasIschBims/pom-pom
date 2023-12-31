import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    GatewayIntentBits,
    Partials, PresenceData
} from "discord.js";
import {Logger} from "../utils/logging/Logger";
import {CommandType} from "../types/Command";
import {EventType} from "../types/Event";
import * as fs from "fs";
import path from "path";
import {ActivityType} from "discord-api-types/v10";

const fileCondition = (fileName: string) => fileName.endsWith(".ts") || fileName.endsWith(".js");

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    public events: Collection<string, EventType<keyof ClientEvents>> = new Collection();
    public presenceData: PresenceData = {
        activities: [{
            name: "the stars rail ⭐",
            type: ActivityType.Watching
        }],
        status: "dnd"
    };

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds],
            partials: [Partials.User, Partials.GuildMember]
        });
    }

    public async start() {
        try {
            console.clear();
            await Logger.printLogo();
            if (!process.env.DISCORD_TOKEN) {
                Logger.logError("No bot token provided (make sure to setup the .env file)", "Startup");
                return;
            }
            this.registerModules();
            this.registerEvents();
            await this.login(process.env.DISCORD_TOKEN);
        } catch (error) {
            Logger.logError(error, "Startup");
            process.exit(1);
        }
    }

    private async registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
        try {
            await this.application?.commands.set(commands);
        } catch (error) {
            Logger.logError(`An error occurred while trying to register the slash commands: \n${error}`, "Slash Commands");
        }
    }

    private registerModules(){
        const slashCommands: Array<ApplicationCommandDataResolvable> = [];

        const commandsBasePath = path.join(__dirname, "..", "commands");
        const commandsFolders = process.env.NODE_ENV === "dev" ? ["dev", "prod"] : ["prod"];

        commandsFolders.forEach(folder => {
            Logger.logInfo(`Loading ${folder} commands...`, "Commands");
            fs.readdirSync(commandsBasePath + `/${folder}/`).forEach(async dirName => {
                if (commandsFolders.includes("dev")) {
                    Logger.debug(`Loading commands from ${dirName}...`, "Commands");
                    Logger.debug(JSON.stringify(fs.readdirSync(commandsBasePath + `/${folder}/${dirName}/`).filter(fileCondition)), "Commands");
                }

                for (const fileName of fs.readdirSync(commandsBasePath + `/${folder}/${dirName}/`).filter(fileCondition)) {
                    const command: CommandType = (await import(`../commands/${folder}/${dirName}/${fileName}`))?.default;
                    const { name } = command;

                    try {
                        if (name) {
                            this.commands.set(name, command);
                            slashCommands.push(command);
                        }
                        Logger.debug(`Loaded ${name} command`, `Commands ${process.env.NODE_ENV === "dev" ? `(${folder})` : ""}`);
                    } catch (error) {
                        Logger.logError(`An error occurred while trying to load the ${name} command: \n${error}`, "Commands");
                    }
                }
            });
        });

        this.on("ready", () => this.registerCommands(slashCommands));
    }
    private registerEvents(){
        const eventBasePath = path.join(__dirname, "..", "events");
        const eventFolders = process.env.NODE_ENV === "dev" ? ["dev", "prod"] : ["prod"];

        eventFolders.forEach(folder => {
            Logger.logInfo(`Loading ${folder} events...`, "Events");

            fs.readdirSync(eventBasePath + `/${folder}/`).filter(fileCondition).forEach(async fileName => {
                const { name, once, run }: EventType<keyof ClientEvents> = (await import(`../events/${folder}/${fileName}`))?.default ?? {};
                if (!name || !run) return;

                try {
                    if (name) (once) ? this.once(name, run) : this.on(name, run);
                    this.events.set(name, { name, once, run });
                    Logger.debug(`Loaded ${name} event`, `Events ${process.env.NODE_ENV === "dev" ? `(${folder})` : ""}`);
                } catch (error) {
                    Logger.logError(`An error occurred while trying to load the ${name} event: \n${error}`, "Events");
                }
            });
        });
    }
}