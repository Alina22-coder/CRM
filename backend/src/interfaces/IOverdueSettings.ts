import { Types } from "mongoose";

interface IOverdueSettings {
    _id: Types.ObjectId;
    enabled: boolean;
    thresholdHours: number;
}

export default IOverdueSettings;
