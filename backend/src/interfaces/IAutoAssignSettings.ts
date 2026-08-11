import { Types } from "mongoose";
import AutoAssignMode from "../enums/auto-assign-mode.enum";

interface IAutoAssignSettings {
    _id: Types.ObjectId;
    enabled: boolean;
    mode: AutoAssignMode;
    participantIds: Types.ObjectId[];
    lastAssignedUserId: Types.ObjectId | null;
}

export default IAutoAssignSettings;
