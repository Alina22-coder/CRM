import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";
import Status from "../enums/status.enum";
import { commentRepository } from "../repositories/comment.repository";
import { Workbook } from "exceljs";

class OrderService {
    public async getAllOrders(query: IOrderQuery, userId: string) {
        let managerSurname: string | undefined;
        if (query.my) {
            const user = await userRepository.getUserById(userId);
            managerSurname = user?.surname;
        }
        return orderRepository.getAllOrders(query, managerSurname);
    }

    public async getOrderById(orderId: string) {
        const [order, comments] = await Promise.all([
            orderRepository.getOrderById(orderId),
            commentRepository.getAllCommentsByOrderId(orderId),
        ]);

        return { ...order?.toObject(), comments };
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

    public async getOrderStatistic() {
        return orderRepository.getOrderStatistic();
    }

    public async getStatisticByManager(userId: string) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return orderRepository.getStatisticByManager(user.surname);
    }

    public async getAllOrdersForExcel(query: IOrderQuery, userId: string) {
        let managerSurname: string | undefined;
        if (query.my) {
            const user = await userRepository.getUserById(userId);
            managerSurname = user?.surname;
        }
        const orders = await orderRepository.getAllOrdersForExcel(
            query,
            managerSurname,
        );

        const workbook = new Workbook();

        const worksheet = workbook.addWorksheet("Orders");

        worksheet.columns = [
            { header: "ID", key: "_id" },
            { header: "Name", key: "name" },
            { header: "Surname", key: "surname" },
            { header: "Email", key: "email" },
            { header: "Phone", key: "phone" },
            { header: "Age", key: "age" },
            { header: "Course", key: "course" },
            { header: "Course format", key: "course_format" },
            { header: "Course type", key: "course_type" },
            { header: "Status", key: "status" },
            { header: "Sum", key: "sum" },
            { header: "Already paid", key: "already_paid" },
            { header: "Created at", key: "created_at" },
            { header: "Manager", key: "manager" },
            { header: "Group", key: "group" },
        ];

        worksheet.addRows(orders);

        return workbook;
    }
}
export const orderService = new OrderService();
