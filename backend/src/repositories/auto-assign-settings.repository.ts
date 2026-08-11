import IAutoAssignSettings from "../interfaces/IAutoAssignSettings";
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
        update: Partial<
            Pick<IAutoAssignSettings, "enabled" | "mode" | "participantIds">
        >,
    ): Promise<IAutoAssignSettings> {
        await this.getSettings();

        const settings = await AutoAssignSettingsModel.findOneAndUpdate(
            {},
            update,
            { new: true },
        );

        return settings as IAutoAssignSettings;
    }

    public async setLastAssignedUserId(userId: string): Promise<void> {
        await AutoAssignSettingsModel.updateOne(
            {},
            { lastAssignedUserId: userId },
        );
    }
}

export const autoAssignSettingsRepository =
    new AutoAssignSettingsRepository();
