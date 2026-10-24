import IAutoAssignSettings, {
    IAutoAssignSettingsUpdate,
} from "../interfaces/IAutoAssignSettings";
import { AutoAssignSettingsModel } from "../models/auto-assign-settings.model";
import AutoAssignMode from "../enums/auto-assign-mode.enum";

class AutoAssignSettingsRepository {
    public async getSettings(): Promise<IAutoAssignSettings> {
        const settings = await AutoAssignSettingsModel.findOneAndUpdate(
            {},
            {
                $setOnInsert: {
                    enabled: false,
                    mode: AutoAssignMode.ROUND_ROBIN,
                    participantIds: [],
                    lastAssignedUserId: null,
                },
            },
            { new: true, upsert: true },
        );

        return settings as IAutoAssignSettings;
    }

    public async updateSettings(
        update: IAutoAssignSettingsUpdate,
    ): Promise<IAutoAssignSettings> {
        await this.getSettings();

        const settings = await AutoAssignSettingsModel.findOneAndUpdate(
            {},
            update,
            { new: true },
        );

        return settings as IAutoAssignSettings;
    }

    public async trySetLastAssignedUserId(
        previousUserId: string | null,
        nextUserId: string,
    ): Promise<boolean> {
        const result = await AutoAssignSettingsModel.updateOne(
            { lastAssignedUserId: previousUserId },
            { lastAssignedUserId: nextUserId },
        );

        return result.modifiedCount === 1;
    }

    public async removeParticipant(userId: string): Promise<void> {
        await AutoAssignSettingsModel.updateOne(
            {},
            { $pull: { participantIds: userId } },
        );
        await AutoAssignSettingsModel.updateOne(
            { lastAssignedUserId: userId },
            { $set: { lastAssignedUserId: null } },
        );
    }
}

export const autoAssignSettingsRepository =
    new AutoAssignSettingsRepository();
