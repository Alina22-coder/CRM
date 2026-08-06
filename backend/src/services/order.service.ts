import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";
import { commentRepository } from "../repositories/comment.repository";
import { Workbook } from "exceljs";
import { applyAutoAssignDefaults } from "../helpers/applyAutoAssignDefaults";
import { historyService } from "./history.service";
import { telegramService } from "./telegram.service";
import { autoAssignService } from "./auto-assign.service";
import NotificationEvent from "../enums/notification-event.enum";
import Status from "../enums/status.enum";

class OrderService {
    public async getAllOrders(query: IOrderQuery, userId: string) {
        let managerSurname: string | undefined;
        if (query.my) {
            const user = await userRepository.getUserById(userId);
            managerSurname = user?.surname;
        }
        return orderRepository.getAllOrders(query, managerSurname);
    }

    public async createOrder(order: Partial<IOrder>) {
        const manager = await autoAssignService.pickManager();

        const createdOrder = await orderRepository.createOrder({
            ...order,
            created_at: new Date(),
            status: Status.NEW,
            manager: manager ?? undefined,
        });

        await telegramService.notifyAdmins(
            NotificationEvent.NEW_ORDER,
            `New order: ${createdOrder.name} ${createdOrder.surname}${
                manager ? ` (auto-assigned to ${manager})` : ""
            }`,
        );

        if (manager) {
            await telegramService.notifyManagerBySurname(
                manager,
                NotificationEvent.NEW_ORDER,
                `New order assigned to you: ${createdOrder.name} ${createdOrder.surname}`,
            );
        }

        return createdOrder;
    }

    public async getOrderById(orderId: string) {
        const [order, comments] = await Promise.all([
            orderRepository.getOrderById(orderId),
            commentRepository.getAllCommentsByOrderId(orderId),
        ]);

        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        return { ...order.toObject(), comments };
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

        const autoFields = applyAutoAssignDefaults(order, user, "edit");
        const updatedFields: Partial<IOrder> = { ...autoFields, ...update };

        const resultingStatus = updatedFields.status ?? order.status;
        const resultingReason =
            updatedFields.disagree_reason ?? order.disagree_reason;

        if (resultingStatus === Status.DISAGGRE && !resultingReason) {
            throw new ApiError(
                "Disagree reason is required when status is Disagree",
                StatusCodes.BAD_REQUEST,
            );
        }

        const updatedOrder = await orderRepository.updateOrderById(
            orderId,
            updatedFields,
        );

        await historyService.logOrderChanges(
            orderId,
            userId,
            order.toObject(),
            updatedFields,
        );

        if (updatedFields.status && updatedFields.status !== order.status) {
            const text = `Order status for ${updatedOrder?.name} ${updatedOrder?.surname}: ${order.status} → ${updatedFields.status}`;

            if (updatedOrder?.manager) {
                await telegramService.notifyManagerBySurname(
                    updatedOrder.manager,
                    NotificationEvent.STATUS_CHANGE,
                    text,
                );
            }

            await telegramService.notifyAdmins(
                NotificationEvent.STATUS_CHANGE,
                text,
                userId,
            );
        }

        return updatedOrder;
    }

    public async getOrderStatistic() {
        return orderRepository.getOrderStatistic();
    }

    public async getLossReport(filter: {
        start_date?: string;
        end_date?: string;
    }) {
        return orderRepository.getLossReport(filter);
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
