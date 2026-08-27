import StatusCodes from "../enums/status-codes.enum";
import IOrder from "../interfaces/IOrder";
import IUser from "../interfaces/IUser";
import ApiError from "../errors/api.error";
import Status from "../enums/status.enum";
import RoleEnum from "../enums/role.enum";

export const applyAutoAssignDefaults = (
    order: IOrder,
    user: IUser,
    action: "edit" | "comment",
): Partial<IOrder> => {
    const isAdmin = user.role === RoleEnum.Admin;

    if (
        !isAdmin &&
        order.manager &&
        order.manager !== user.surname
    ) {
        throw new ApiError(
            `You can only ${action} your own orders`,
            StatusCodes.FORBIDDEN,
        );
    }

    const updatedFields: Partial<IOrder> = {};

    if (!isAdmin && !order.manager) {
        updatedFields.manager = user.surname;
    }

    if (!order.status || order.status === Status.NEW) {
        updatedFields.status = Status.IN_WORK;
    }

    return updatedFields;
};
