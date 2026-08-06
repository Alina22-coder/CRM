import mongoose from "mongoose";
import IAutoAssignSettings from "../interfaces/IAutoAssignSettings";
import AutoAssignMode from "../enums/auto-assign-mode.enum";

const Schema = mongoose.Schema;

const autoAssignSettingsSchema = new Schema({
    enabled: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        enum: AutoAssignMode,
        default: AutoAssignMode.ROUND_ROBIN,
    },
    participantIds: {
        type: [Schema.Types.ObjectId],
        ref: "user",
        default: [],
    },
    lastAssignedIndex: {
        type: Number,
        default: -1,
    },
});

export const AutoAssignSettingsModel = mongoose.model<IAutoAssignSettings>(
    "auto_assign_settings",
    autoAssignSettingsSchema,
);
