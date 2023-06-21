import {ApplicationCommandType, EmbedBuilder} from "discord.js";
import {Command} from "../../../structs/Command";
import {fetchStamina} from "../../../utils/starrail/FetchStamina";

// cooldown: 15 minutes
const cooldown = 15 * 60 * 1000;
const cooldowns = new Set();

export default new Command({
    name: "checkstamina",
    description: "Check your current Trailblaze Power.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    run: async ({ interaction }) => {
        if (cooldowns.has(interaction.user.id)) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setTitle("Error")
                    .setDescription(`You can only use this command once every ${cooldown / 1000 / 60} minutes.`)
            ],
            ephemeral: true,
        });

        const data = await fetchStamina(interaction.user);

        if (data.error) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#b9021b")
                        .setTimestamp()
                        .setTitle("Error")
                        .setDescription(data.error)
                ],
                ephemeral: true,
            });
        }

        cooldowns.add(interaction.user.id);
        setTimeout(() => cooldowns.delete(interaction.user.id), cooldown);

        const currentStamina = data.currentStamina;
        const maxStamina = data.maxStamina;
        const recoveryTime = Number(data.recoveryTime);

        const hours = Math.floor(recoveryTime / 3600);
        const minutes = Math.floor((recoveryTime % 3600) / 60);
        const seconds = Math.floor((recoveryTime % 3600) % 60);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setTitle("Trailblaze Power")
                    .addFields([
                        {
                            name: "Current Power",
                            value: currentStamina + "/" + maxStamina,
                            inline: true,
                        },
                        {
                            name: "Recovery Time",
                            value: hours + "h " + minutes + "m " + seconds + "s",
                            inline: true,
                        }
                    ])
            ],
            ephemeral: true,
        });
    }
});