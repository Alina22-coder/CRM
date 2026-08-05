import TelegramBot from "node-telegram-bot-api";
import config from "./config";

export const bot: TelegramBot | null = config.TELEGRAM_BOT_TOKEN
    ? new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true })
    : null;
