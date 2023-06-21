import {ApplicationCommandType, EmbedBuilder} from "discord.js";
import {Command} from "../../../structs/Command";

export default new Command({
    name: "ping",
    description: "Displays the bots latency",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    run: async ({ interaction }) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setTitle("Pong! 🏓")
                    .setDescription(`Ping: **${Date.now() - interaction.createdTimestamp}ms**`)
            ]
        });
    }
});