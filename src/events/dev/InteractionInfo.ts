import {Event} from "../../types/Event";
import {Logger} from "../../utils/logging/Logger";

export default new Event({
    name: "interactionCreate",
    once: false,
    async run(interaction) {
        Logger.logInfo(`Interaction type: ${interaction.type}`, "Interaction");
        interaction.isCommand() ? Logger.logInfo(`Interaction command name: ${interaction.commandName}`, "Interaction") : null;
        Logger.logInfo(`Interaction user: ${interaction.user.tag}`, "Interaction");
    },
});