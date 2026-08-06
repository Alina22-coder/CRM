export type AutoAssignMode = "round_robin" | "load_based";

export const AUTO_ASSIGN_MODE_LABELS: Record<AutoAssignMode, string> = {
    round_robin: "Round-robin",
    load_based: "By workload",
};

export interface IAutoAssignSettings {
    _id: string;
    enabled: boolean;
    mode: AutoAssignMode;
    participantIds: string[];
    lastAssignedIndex: number;
}
