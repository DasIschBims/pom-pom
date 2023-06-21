import {ApplicationCommandType, EmbedBuilder} from "discord.js";
import {Command} from "../../../structs/Command";
import {prisma} from "../../../utils/db/Prisma";
import {upsertUser} from "../../../utils/user/UpsertUser";

export default new Command({
    name: "debug-db",
    description: "Developer command",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    run: async ({ interaction }) => {
        await interaction.deferReply();

        await upsertUser(interaction.user);

        const userEntries = await prisma.user.findFirst({
            where: {
                userId: interaction.user.id
            }
        });
        
        if (userEntries) {
            userEntries.hoyoCookie = "CENSORED";
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setTitle("Debug Database")
                    .addFields(
                        {
                            name: "Table: User",
                            value: "```json\n" + JSON.stringify(userEntries, null, 2) + "```"
                        }
                    )
            ]
        });
    }
});