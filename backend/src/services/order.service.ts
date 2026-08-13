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
import { notificationService } from "./notification.service";
import { autoAssignService } from "./auto-assign.service";
import NotificationEvent from "../enums/notification-event.enum";
import Status from "../enums/status.enum";
import RoleEnum from "../enums/role.enum";

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
            status_updated_at: new Date(),
            manager: manager ?? undefined,
        });

        if (manager) {
            const managerUser = await userRepository.getUserBySurname(manager);

            if (managerUser) {
                await historyService.logOrderChanges(
                    createdOrder._id,
                    managerUser._id,
                    {},
                    { manager },
                );
            }
        }

        const newOrderText = `New order: ${createdOrder.name} ${createdOrder.surname}${
            manager ? ` (auto-assigned to ${manager})` : ""
        }`;

        await telegramService.notifyAdmins(
            NotificationEvent.NEW_ORDER,
            newOrderText,
        );
        await notificationService.notifyAdmins(
            NotificationEvent.NEW_ORDER,
            newOrderText,
            undefined,
            createdOrder._id.toString(),
        );

        if (manager) {
            const assignedText = `New order assigned to you: ${createdOrder.name} ${createdOrder.surname}`;

            await telegramService.notifyManagerBySurname(
                manager,
                NotificationEvent.NEW_ORDER,
                assignedText,
            );
            await notificationService.notifyManagerBySurname(
                manager,
                NotificationEvent.NEW_ORDER,
                assignedText,
                createdOrder._id.toString(),
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

        const resultingSum = updatedFields.sum ?? order.sum;
        const resultingAlreadyPaid =
            updatedFields.already_paid ?? order.already_paid;

        if (
            !update.status &&
            resultingSum > 0 &&
            resultingAlreadyPaid >= resultingSum &&
            order.status !== Status.AGGRE
        ) {
            updatedFields.status = Status.AGGRE;
        }

        const statusChanging =
            !!updatedFields.status && updatedFields.status !== order.status;

        if (statusChanging && updatedFields.status !== Status.DISAGGRE) {
            updatedFields.disagree_reason = null;
            updatedFields.disagree_reason_comment = null;
            updatedFields.disagree_at = null;
        }

        const resultingStatus = updatedFields.status ?? order.status;
        const enteringDisagree =
            statusChanging && updatedFields.status === Status.DISAGGRE;
        const resultingReason = enteringDisagree
            ? update.disagree_reason
            : updatedFields.disagree_reason ?? order.disagree_reason;

        if (resultingStatus === Status.DISAGGRE && !resultingReason) {
            throw new ApiError(
                "Disagree reason is required when status is Disagree",
                StatusCodes.BAD_REQUEST,
            );
        }

        if (statusChanging) {
            updatedFields.status_updated_at = new Date();
            updatedFields.is_overdue = false;

            if (updatedFields.status === Status.DISAGGRE) {
                updatedFields.disagree_at = new Date();
            }
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
                await notificationService.notifyManagerBySurname(
                    updatedOrder.manager,
                    NotificationEvent.STATUS_CHANGE,
                    text,
                    orderId,
                );
            }

            await telegramService.notifyAdmins(
                NotificationEvent.STATUS_CHANGE,
                text,
                userId,
            );
            await notificationService.notifyAdmins(
                NotificationEvent.STATUS_CHANGE,
                text,
                userId,
                orderId,
            );
        }

        return updatedOrder;
    }

    public async updateOrderTags(orderId: string, tags: string[]) {
        const order = await orderRepository.getOrderById(orderId);

        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        return orderRepository.updateOrderById(orderId, { tags });
    }

    public async reassignOrder(
        orderId: string,
        managerSurname: string,
        adminUserId: string,
    ) {
        const order = await orderRepository.getOrderById(orderId);

        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        const manager = await userRepository.getUserBySurname(managerSurname);

        if (!manager || manager.role !== RoleEnum.Manager) {
            throw new ApiError("Manager not found", StatusCodes.BAD_REQUEST);
        }

        const previousManager = order.manager;
        const updatedOrder = await orderRepository.updateOrderById(orderId, {
            manager: managerSurname,
        });

        await historyService.logOrderChanges(
            orderId,
            adminUserId,
            { manager: previousManager },
            { manager: managerSurname },
        );

        const text = `Order reassigned to you: ${order.name} ${order.surname}`;

        await telegramService.notifyManagerBySurname(
            managerSurname,
            NotificationEvent.STATUS_CHANGE,
            text,
        );
        await notificationService.notifyManagerBySurname(
            managerSurname,
            NotificationEvent.STATUS_CHANGE,
            text,
            orderId,
        );

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
