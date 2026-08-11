import { autoAssignSettingsRepository } from "../repositories/auto-assign-settings.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import AutoAssignMode from "../enums/auto-assign-mode.enum";
import RoleEnum from "../enums/role.enum";
import IAutoAssignSettings from "../interfaces/IAutoAssignSettings";
import IUser from "../interfaces/IUser";

class AutoAssignService {
    public getSettings(): Promise<IAutoAssignSettings> {
        return autoAssignSettingsRepository.getSettings();
    }

    public updateSettings(update: {
        enabled?: boolean;
        mode?: AutoAssignMode;
        participantIds?: string[];
    }) {
        return autoAssignSettingsRepository.updateSettings(update as any);
    }

    public async pickManager(): Promise<string | null> {
        const settings = await autoAssignSettingsRepository.getSettings();

        if (!settings.enabled || settings.participantIds.length === 0) {
            return null;
        }

        const participants = await Promise.all(
            settings.participantIds.map((id) =>
                userRepository.getUserById(id.toString()),
            ),
        );

        const activeParticipants = participants.filter(
            (user): user is IUser =>
                !!user &&
                user.is_active &&
                !user.is_banned &&
                !user.isDeleted &&
                user.role === RoleEnum.Manager,
        );

        if (activeParticipants.length === 0) {
            return null;
        }

        if (settings.mode === AutoAssignMode.LOAD_BASED) {
            return this.pickByLoad(activeParticipants);
        }

        return this.pickByRoundRobin(settings, activeParticipants);
    }

    private async pickByRoundRobin(
        settings: IAutoAssignSettings,
        activeParticipants: IUser[],
    ): Promise<string> {
        const lastAssignedUserId = settings.lastAssignedUserId?.toString();
        const lastIndex = lastAssignedUserId
            ? activeParticipants.findIndex(
                  (user) => user._id.toString() === lastAssignedUserId,
              )
            : -1;

        const nextIndex = (lastIndex + 1) % activeParticipants.length;
        const manager = activeParticipants[nextIndex];

        await autoAssignSettingsRepository.setLastAssignedUserId(manager._id);

        return manager.surname;
    }

    private async pickByLoad(
        activeParticipants: IUser[],
    ): Promise<string> {
        const surnames = activeParticipants.map((user) => user.surname);
        const counts =
            await orderRepository.getActiveOrderCountsByManagers(surnames);

        let selected = surnames[0];
        for (const surname of surnames) {
            if (counts[surname] < counts[selected]) {
                selected = surname;
            }
        }

        return selected;
    }
}

export const autoAssignService = new AutoAssignService();
