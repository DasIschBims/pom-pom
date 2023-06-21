declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            NODE_ENV: "dev" | "prod" | "debug";
            DATABASE_URL: string;
        }
    }
}

export { };