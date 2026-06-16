import { Request, Response, NextFunction } from "express";
import { IUserLoginDTO } from "../interfaces/IUser";
import { authService } from "../services/auth.service";
import StatusCodes from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/IToken";

class AuthController {
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

            const { refreshToken } = req.body;

            const tokens = await authService.refresh(
                userId,
                role,
                refreshToken,
            );

            res.status(StatusCodes.OK).json(tokens);
        } catch (e) {
            next(e);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken = req.headers.authorization?.split(
                " ",
            )[1] as string;

            await authService.logout(accessToken);

            res.status(StatusCodes.NO_CONTENT).send();
        } catch (e) {
            next(e);
        }
    }

    public async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;

            const token = await authService.activate(userId);

            res.status(StatusCodes.OK).json({ token });
        } catch (e) {
            next(e);
        }
    }

    public async setPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;

            await authService.setPassword(token, password);

            res.status(StatusCodes.OK).json({
                message: "Password set successfully",
            });
        } catch (e) {
            next(e);
        }
    }

    public async recoveryPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.userId as string;

            const token = await authService.recoveryPassword(userId);

            res.status(StatusCodes.OK).json({ token });
        } catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();
