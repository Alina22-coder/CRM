import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { userService } from "../services/user.service";
import { IUserRegisterDTO } from "../interfaces/IUser";

class UserController {
    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        const data = await userService.getAllUsers();
        res.status(StatusCodes.OK).json(data);
        next();
    }

    public async getUserById(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id as string;
        const data = await userService.getUserById(id);

        res.status(StatusCodes.OK).json(data);
        next();
    }

    public async createUser(req: Request, res: Response, next: NextFunction) {
        const user = req.body as IUserRegisterDTO;
        const data = await userService.createUser(user);
        res.status(StatusCodes.CREATED).json(data);
        next();
    }
}

export const userController = new UserController();
