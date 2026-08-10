import joi from "joi";

export class OverdueSettingsValidator {
    public static update = joi.object({
        enabled: joi.boolean(),
        thresholdHours: joi.number().min(1),
    });
}
