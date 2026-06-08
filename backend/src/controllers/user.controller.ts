import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { userService } from "../services/user.service";

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
}

export const userController = new UserController();
