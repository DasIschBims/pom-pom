import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";
import {Command} from "../../../structs/Command";
import {stripIndents,oneLine} from "common-tags";
import {dependencies,version,repository} from "../../../../package.json";

export default new Command({
    name: "botinfo",
    description: "Displays information about the bot",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    run: async ({ interaction }) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.client.user.tag}`)
                    .setDescription(oneLine`
                        pom-pom is an open source discord bot written with typescript and discord.js which is currently in a total of **${interaction.client.guilds.cache.size.toLocaleString()}** servers.
                        Check out the source code **[here](
                        ${repository.url.replace(/\.git$/,"").replace(/^git\+/,"")}
                        )** or via the GitHub button below.
                        
                        It's main purpose is to check the current amount of Trailblaze Power by fetching it from the API.
                    `)
                    .addFields([
                        {
                            name: "Developer",
                            value: `@dasischbims (<@!337296708117594113>)`,
                            inline: true
                        },
                        {
                            name: "Fetch",
                            value: stripIndents`\`\`\`asciidoc
                                        Version      :: ${version}
                                        NODE_ENV     :: ${process.env.NODE_ENV}
                                        OS           :: ${process.platform} (${process.arch})
                                        Uptime       :: ${Math.floor(process.uptime() / 60 / 60)}h ${Math.floor(process.uptime() / 60) % 60}m ${Math.floor(process.uptime()) % 60}s
                                        Memory       :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB/${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB
                                        Packages     :: ${Object.keys(dependencies).length}
                                        Discord.js   :: v${
                                            dependencies['discord.js'].substring(1) || ''
                                        }
                                        Environment  :: Node.js ${process.version}
                                    \`\`\``
                        }
                    ])
                    .setColor("#b9021b")
                    .setTimestamp()
                    .setThumbnail(interaction.client.user.displayAvatarURL({ size: 512, forceStatic: true, extension: "png" }))
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>().setComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel("Invite Bot")
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=280576&scope=bot%20applications.commands`),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel("GitHub")
                        .setURL(repository.url.replace(/\.git$/,"").replace(/^git\+/,""))
                )
            ]
        });
    }
});