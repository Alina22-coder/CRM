import joi from "joi";
import NotificationEvent from "../enums/notification-event.enum";

export class TelegramValidator {
    public static preferences = joi.object(
        Object.values(NotificationEvent).reduce(
            (schema, event) => ({ ...schema, [event]: joi.boolean() }),
            {} as Record<string, joi.BooleanSchema>,
        ),
    );
}
