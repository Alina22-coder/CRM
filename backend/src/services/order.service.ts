import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";
import Status from "../enums/status.enum";
import IUser from "../interfaces/IUser";

class OrderService {
    public getAllOrders(query: IOrderQuery) {
        return orderRepository.getAllOrders(query);
    }

    public getOrderById(orderId: string) {
        return orderRepository.getOrderById(orderId);
    }

    public async updateOrderById(
        orderId: string,
        update: Partial<IOrder>,
        userId: string,
    ) {
        const order = await orderRepository.getOrderById(orderId);

        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        if (order.manager && order.manager !== user.surname) {
            throw new ApiError(
                "You can only edit your own orders",
                StatusCodes.FORBIDDEN,
            );
        }

        const updatedFields: Partial<IOrder> = { ...update };

        if (!order.manager) {
            updatedFields.manager = user.surname;
        }

        if (!order.status || order.status === Status.NEW) {
            updatedFields.status = Status.IN_WORK;
        }

        return orderRepository.updateOrderById(orderId, updatedFields);
    }

    public async getStatistic() {
        return orderRepository.getStatistic();
    }

    public async getStatisticByManager(userId: string) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return orderRepository.getStatisticByManager(user.surname);
    }
}
export const orderService = new OrderService();
