import { overdueSettingsRepository } from "../repositories/overdue-settings.repository";
import IOverdueSettings from "../interfaces/IOverdueSettings";

class OverdueSettingsService {
    public getSettings(): Promise<IOverdueSettings> {
        return overdueSettingsRepository.getSettings();
    }

    public updateSettings(update: {
        enabled?: boolean;
        thresholdHours?: number;
    }) {
        return overdueSettingsRepository.updateSettings(update);
    }
}

export const overdueSettingsService = new OverdueSettingsService();
