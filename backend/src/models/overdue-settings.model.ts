import mongoose from "mongoose";
import IOverdueSettings from "../interfaces/IOverdueSettings";

const Schema = mongoose.Schema;

const overdueSettingsSchema = new Schema({
    enabled: {
        type: Boolean,
        default: false,
    },
    thresholdHours: {
        type: Number,
        default: 24,
    },
});

export const OverdueSettingsModel = mongoose.model<IOverdueSettings>(
    "overdue_settings",
    overdueSettingsSchema,
);
