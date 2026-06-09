import { Request, Response, NextFunction } from "express";
import { IUserLoginDTO, IUserRegisterDTO } from "../interfaces/IUser";
import { authService } from "../services/auth.service";
import StatusCodes from "../enums/status-codes.enum";

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUserRegisterDTO;

            const data = await authService.register(body);

            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as IUserLoginDTO;

            const data = await authService.login(dto);

            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();
