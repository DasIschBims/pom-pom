import {User} from "discord.js";
import {prisma} from "../db/Prisma";

export const upsertUser = async (
    user: User
) => {
    if (user.bot) return;

    const userId = user.id;

    return prisma.user.upsert({
        where: {
            userId: userId
        },
        create: {
            userId: userId,
            starRailUID: "",
            hoyoCookie: "",
        },
        update: {
            userId: userId,
        }
    });
};