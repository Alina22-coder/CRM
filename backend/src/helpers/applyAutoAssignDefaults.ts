import StatusCodes from "../enums/status-codes.enum";
import IOrder from "../interfaces/IOrder";
import IUser from "../interfaces/IUser";
import ApiError from "../errors/api.error";
import Status from "../enums/status.enum";
import { getManagerId } from "./getManagerId";

export const applyAutoAssignDefaults = (
    order: IOrder,
    user: IUser,
    action: "edit" | "comment",
): Partial<IOrder> => {
    const orderManagerId = getManagerId(order.manager);
    const userId = String(user._id);

    if (orderManagerId && orderManagerId !== userId) {
        throw new ApiError(
            `You can only ${action} your own orders`,
            StatusCodes.FORBIDDEN,
        );
    }

    const updatedFields: Partial<IOrder> = {};

    if (!orderManagerId) {
        updatedFields.manager = user._id;
    }

    if (!order.status || order.status === Status.NEW) {
        updatedFields.status = Status.IN_WORK;
    }

    return updatedFields;
};
