import {Logger} from "../logging/Logger";
import * as crypto from "crypto";
import {StaminaData} from "../../types/StarRail";
import {prisma} from "../db/Prisma";
import {User} from "discord.js";
import {getAccountRegion} from "./AccountRegion";

const ds_salt = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
const url = "https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/note";

export const fetchStamina = async (user: User): Promise<StaminaData> => {
    const user_data = await prisma.user.findUnique({
        where: {
            userId: user.id,
        }
    });

    if (!user_data || !user_data.starRailUID || !user_data.hoyoCookie) {
        Logger.logError("Failed to fetch stamina data: user_data is null", "FetchStamina.ts");
        return {
            error: "Failed to fetch stamina data: did you add your UID and cookie yet?",
        };
    }

    const server = getAccountRegion(user_data.starRailUID);

    if (!server) {
        Logger.logError("Failed to fetch stamina data: invalid UID", "FetchStamina.ts");
        return {
            error: "Failed to fetch stamina data: invalid UID",
        };
    }

    const payload = {
        server: server,
        role_id: user_data.starRailUID,
    };

    const response = await fetch(url + "?server=" + payload.server + "&role_id=" + payload.role_id, {
        method: "GET",

        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "x-rpc-app_version": "1.5.0",
            "x-rpc-client_type": "5",
            "x-rpc-language": "en-us",
            "Cookie": user_data.hoyoCookie,
            "DS": generateDS(ds_salt),
        }
    });

    if (response.status !== 200) {
        Logger.logError("Failed to fetch stamina data: " + response.statusText, "FetchStamina.ts");
        return {
            error: "Failed to fetch stamina data: " + response.statusText,
        };
    }

    const data = await response.json();

    if (data) {
        return {
            currentStamina: data.data.current_stamina,
            maxStamina: data.data.max_stamina,
            recoveryTime: data.data.stamina_recover_time,
        };
    } else {
        Logger.logError("Failed to fetch stamina data: " + response.statusText, "FetchStamina.ts");
        return {
            error: "Failed to fetch stamina data: " + response.statusText,
        };
    }
};



function randomString(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

function getHash(str: string) {
    return crypto
        .createHash("md5")
        .update(str)
        .digest("hex");
}

function generateDS(salt: string) {
    const time = (Date.now() / 1000).toFixed(0);
    const random = randomString(6);
    const hash = getHash(`salt=${salt}&t=${time}&r=${random}`);

    return `${time},${random},${hash}`;
}