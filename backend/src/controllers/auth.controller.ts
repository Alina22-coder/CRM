import { Request, Response, NextFunction } from "express";
import { IUserLoginDTO, IUserRegisterDTO } from "../interfaces/IUser";
import { authService } from "../services/auth.service";
import StatusCodes from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/IToken";
import { tokenService } from "../services/token.service";
import { tokenRepository } from "../repositories/token.repository";

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

    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, userId } = res.locals.tokenPayload as ITokenPayload;
            const tokens = tokenService.generateToken({ role, userId });
            await tokenRepository.create({
                ...tokens,
                _userId: userId,
            });
            res.status(StatusCodes.OK).json(tokens);
        } catch (e) {
            next(e);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken = req.headers.authorization?.split(" ")[1];
            await tokenRepository.deleteByParams({ accessToken });
            res.status(StatusCodes.NO_CONTENT).send();
        } catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();
