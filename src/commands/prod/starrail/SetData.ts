import {ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder} from "discord.js";
import {Command} from "../../../structs/Command";
import {upsertUser} from "../../../utils/user/UpsertUser";
import {prisma} from "../../../utils/db/Prisma";

export default new Command({
    name: "setdata",
    description: "Set your UID and cookie for interacting with the API.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    options: [
        {
            name: "uid",
            description: "Your UID.",
            type: ApplicationCommandOptionType.String,
            required: true,
            min_length: 9,
            max_length: 9,
        },
        {
            name: "cookie",
            description: "Your cookie.",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    run: async ({ interaction }) => {
        const uid = interaction.options.get("uid");
        const cookie = interaction.options.get("cookie");

        await upsertUser(interaction.user);

        const user_data = await prisma.user.findUnique({
            where: {
                userId: interaction.user.id,
            }
        });

        if (!user_data) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#b9021b")
                        .setTimestamp()
                        .setTitle("Error")
                        .setDescription("Failed to set data: user_data is null")
                ],
                ephemeral: true,
            });
            return;
        }

        await prisma.user.update({
            where: {
                userId: interaction.user.id,
            },
            data: {
                starRailUID: uid.value as string,
                hoyoCookie: cookie.value as string,
            }
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setTitle("Success")
                    .setDescription("Successfully set data.")
            ],
            ephemeral: true,
        });
    }
});