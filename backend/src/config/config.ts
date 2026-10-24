import type { SignOptions } from "jsonwebtoken";

type TokenLifetime = NonNullable<SignOptions["expiresIn"]>;

interface IConfig {
    PORT: string;
    MONGODB_URI: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_LIFETIME: TokenLifetime;
    JWT_REFRESH_LIFETIME: TokenLifetime;
    JWT_ACTIVATE_SECRET: string;
    JWT_ACTIVATE_LIFETIME: TokenLifetime;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    TELEGRAM_BOT_TOKEN: string;
}

const config: IConfig = {
    PORT: process.env.PORT || "5000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/crm",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_ACCESS_LIFETIME: (process.env.JWT_ACCESS_LIFETIME ||
        "10m") as TokenLifetime,
    JWT_REFRESH_LIFETIME: (process.env.JWT_REFRESH_LIFETIME ||
        "20m") as TokenLifetime,
    JWT_ACTIVATE_SECRET: process.env.JWT_ACTIVATE_SECRET || "",
    JWT_ACTIVATE_LIFETIME: (process.env.JWT_ACTIVATE_LIFETIME ||
        "30m") as TokenLifetime,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@gmail.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
};

export default config;
