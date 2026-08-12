import IOverdueSettings from "../interfaces/IOverdueSettings";
import { OverdueSettingsModel } from "../models/overdue-settings.model";

class OverdueSettingsRepository {
    public async getSettings(): Promise<IOverdueSettings> {
        const settings = await OverdueSettingsModel.findOneAndUpdate(
            {},
            {
                $setOnInsert: {
                    enabled: false,
                    thresholdHours: 24,
                },
            },
            { new: true, upsert: true },
        );

        return settings as IOverdueSettings;
    }

    public async updateSettings(
        update: Partial<Pick<IOverdueSettings, "enabled" | "thresholdHours">>,
    ): Promise<IOverdueSettings> {
        await this.getSettings();

        const settings = await OverdueSettingsModel.findOneAndUpdate(
            {},
            update,
            { new: true },
        );

        return settings as IOverdueSettings;
    }
}

export const overdueSettingsRepository = new OverdueSettingsRepository();
