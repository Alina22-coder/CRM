import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { userService } from "../services/user.service";
import { IUserRegisterDTO } from "../interfaces/IUser";
import { userRepository } from "../repositories/user.repository";

class UserController {
    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await userService.getAllUsers();
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await userService.getUserById(id);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body as IUserRegisterDTO;
            const data = await userService.createUser(user);
            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async banUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await userService.updateUserById(id, { is_banned: true });
            res.status(StatusCodes.OK).json({ message: "User banned" });
        } catch (e) {
            next(e);
        }
    }

    public async unBanUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await userService.updateUserById(id, { is_banned: false });
            res.status(StatusCodes.OK).json({ message: "User unbanned" });
        } catch (e) {
            next(e);
        }
    }
}

export const userController = new UserController();
