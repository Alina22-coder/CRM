import crypto from "crypto";
import { bot } from "../config/telegram.config";
import { telegramRepository } from "../repositories/telegram.repository";
import { userRepository } from "../repositories/user.repository";
import NotificationEvent from "../enums/notification-event.enum";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

const LINK_CODE_LIFETIME_MS = 10 * 60 * 1000;

class TelegramService {
    public async generateLinkCode(userId: string): Promise<string> {
        const code = crypto.randomBytes(4).toString("hex");
        const expiresAt = new Date(Date.now() + LINK_CODE_LIFETIME_MS);

        await telegramRepository.createLinkToken(userId, code, expiresAt);

        return code;
    }

    public async handleStartCommand(
        code: string,
        chatId: number,
    ): Promise<void> {
        const token = await telegramRepository.findValidToken(code);

        if (!token) {
            await bot?.sendMessage(
                chatId,
                "This code is invalid or has expired. Generate a new one in your CRM profile.",
            );
            return;
        }

        const existingOwner = await userRepository.getUserByTelegramChatId(
            String(chatId),
        );

        if (existingOwner && existingOwner._id !== token.user.toString()) {
            await userRepository.unsetTelegramChatId(existingOwner._id);
        }

        await userRepository.updateUserById(token.user.toString(), {
            telegram_chat_id: String(chatId),
        });

        await telegramRepository.deleteToken(token._id.toString());

        await bot?.sendMessage(
            chatId,
            "Your Telegram account has been successfully linked to CRM.",
        );
    }

    public async getStatus(userId: string): Promise<{
        telegram_chat_id: string | null;
        telegram_notifications: Partial<Record<NotificationEvent, boolean>>;
    }> {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return {
            telegram_chat_id: user.telegram_chat_id,
            telegram_notifications: user.telegram_notifications ?? {},
        };
    }

    public async unlink(userId: string): Promise<void> {
        await userRepository.unsetTelegramChatId(userId);
        await telegramRepository.deleteTokensByUserId(userId);
    }

    public async updatePreferences(
        userId: string,
        preferences: Partial<Record<NotificationEvent, boolean>>,
    ): Promise<void> {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        await userRepository.updateUserById(userId, {
            telegram_notifications: {
                ...user.telegram_notifications,
                ...preferences,
            },
        });
    }

    public async notify(
        userId: string,
        event: NotificationEvent,
        text: string,
    ): Promise<void> {
        if (!bot) return;

        const user = await userRepository.getUserById(userId);

        if (!user?.telegram_chat_id) return;
        if (!user.telegram_notifications?.[event]) return;

        await bot.sendMessage(user.telegram_chat_id, text);
    }

    public async notifyManagerBySurname(
        surname: string,
        event: NotificationEvent,
        text: string,
    ): Promise<void> {
        if (!bot) return;

        const manager = await userRepository.getUserBySurname(surname);

        if (!manager) return;

        await this.notify(manager._id, event, text);
    }

    public async notifyAdmins(
        event: NotificationEvent,
        text: string,
        excludeUserId?: string,
    ): Promise<void> {
        if (!bot) return;

        const admins = await userRepository.getAdminsWithTelegram();

        await Promise.all(
            admins
                .filter((admin) => admin._id !== excludeUserId)
                .map((admin) => this.notify(admin._id, event, text)),
        );
    }
}

export const telegramService = new TelegramService();

bot?.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
    const code = match?.[1];

    if (!code) {
        bot?.sendMessage(
            msg.chat.id,
            "To link your account, generate a code in your CRM profile and follow the link again.",
        );
        return;
    }

    telegramService.handleStartCommand(code, msg.chat.id);
});
