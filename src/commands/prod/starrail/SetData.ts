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

        if (user_data.firstUse) {
            await prisma.user.update({
                where: {
                    userId: interaction.user.id,
                },
                data: {
                    firstUse: false,
                }
            });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#b9021b")
                        .setTitle("Terms of Service")
                        .setDescription("By using this bot, you agree to the following Terms of Service:\n\n(If you want to set your data, run the command ``/setdata`` again.)")
                        .addFields([
                            {
                                name: "1. Data Usage",
                                value: "I assure you that I do not use the data you provide for any malicious purposes. Furthermore, I do not access or examine any data provided through the bot. The bot is designed to process the data you provide for its intended functionality only."
                            },
                            {
                                name: "2. Data Security",
                                value: "The bot is hosted on a private Virtual Private Server (VPS), running two separate docker containers—one for the bot itself and another for the database. These containers are properly secured against potential attacks to the best of my knowledge and abilities."
                            },
                            {
                                name: "3. Limited Liability",
                                value: "While I take precautions to maintain the bot's security, please be aware that I am not responsible for any damage that may occur when the bot is hosted by malicious actors or similar entities. Additionally, I am not liable for any other types of damage that may arise from the use of this software."
                            },
                            {
                                name: "4. Data Deletion",
                                value: "If you wish to delete your data, just run the command ``/unsetdata``. This will delete all data associated with your Discord account from the database."
                            }
                        ])
                        .setFooter({text: "The terms of service may be updated at any time and can be viewed by running the command ``/tos``."})
                        .setThumbnail(interaction.client.user?.displayAvatarURL())
                ],
                ephemeral: true,
            });
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