import {ApplicationCommandType, EmbedBuilder} from "discord.js";
import {Command} from "../../../structs/Command";
import {prisma} from "../../../utils/db/Prisma";

export default new Command({
    name: "unsetdata",
    description: "Remove all your data from the database.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    run: async ({ interaction }) => {
        await prisma.user.delete({
            where: {
                userId: interaction.user.id,
            }
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTitle("Success")
                    .setDescription("Successfully removed all the data you've provided to the bot and removed your profile from the database.")
                    .setFooter({text: "Note that you can still use the bot, but you'll have to provide your UID and cookie again."})
            ],
            ephemeral: true,
        });
    }
});