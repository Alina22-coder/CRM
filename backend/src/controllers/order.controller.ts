import { orderService } from "../services/order.service";
import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { IOrderQuery } from "../interfaces/IOrder";
import { ITokenPayload } from "../interfaces/IToken";
import ApiError from "../errors/api.error";
import RoleEnum from "../enums/role.enum";

class OrderController {
    public async getAllOrders(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const query = res.locals.query as IOrderQuery;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await orderService.getAllOrders(query, userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.createOrder(req.body);
            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await orderService.getOrderById(id);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async updateOrderById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await orderService.updateOrderById(
                id,
                req.body,
                userId,
            );
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async updateOrderTags(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            const { tags } = req.body;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await orderService.updateOrderTags(id, tags, userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async reassignOrder(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            const { manager } = req.body;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await orderService.reassignOrder(id, manager, userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getOrderStatistic(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data = await orderService.getOrderStatistic();
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getLossReport(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const query = res.locals.query as {
                start_date?: string;
                end_date?: string;
            };
            const data = await orderService.getLossReport(query);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getStatisticByManager(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.id as string;
            const { userId: currentUserId, role } = res.locals
                .tokenPayload as ITokenPayload;

            if (role !== RoleEnum.Admin && userId !== currentUserId) {
                throw new ApiError(
                    "You can only view your own statistic",
                    StatusCodes.FORBIDDEN,
                );
            }

            const data = await orderService.getStatisticByManager(userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getAllOrdersForExcel(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const query = res.locals.query as IOrderQuery;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const workbook = await orderService.getAllOrdersForExcel(query, userId);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=orders.xlsx",
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (e) {
            next(e);
        }
    }
}

export const orderController = new OrderController();
