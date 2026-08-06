import IAutoAssignSettings from "../interfaces/IAutoAssignSettings";
import { AutoAssignSettingsModel } from "../models/auto-assign-settings.model";
import AutoAssignMode from "../enums/auto-assign-mode.enum";

class AutoAssignSettingsRepository {
    public async getSettings(): Promise<IAutoAssignSettings> {
        let settings = await AutoAssignSettingsModel.findOne();

        if (!settings) {
            settings = await AutoAssignSettingsModel.create({
                enabled: false,
                mode: AutoAssignMode.ROUND_ROBIN,
                participantIds: [],
                lastAssignedIndex: -1,
            });
        }

        return settings;
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

    public async setLastAssignedIndex(index: number): Promise<void> {
        await AutoAssignSettingsModel.updateOne(
            {},
            { lastAssignedIndex: index },
        );
    }
}

export const autoAssignSettingsRepository =
    new AutoAssignSettingsRepository();
