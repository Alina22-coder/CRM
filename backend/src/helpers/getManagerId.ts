import IOrder from "../interfaces/IOrder";

export const getManagerId = (
    manager: IOrder["manager"],
): string | null => {
    if (manager == null) return null;

    if (typeof manager === "object" && "_id" in manager) {
        return String((manager as { _id: unknown })._id);
    }

    return String(manager);
};
