import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";
import { tokenService } from "../services/token.service";
import { IRefresh } from "../interfaces/IToken";

class AuthMiddleware {
    public async checkAccessToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authorizationHeader = req.headers.authorization;

            if (!authorizationHeader) {
                throw new ApiError(
                    "No token provided",
                    StatusCodes.UNAUTHORIZED,
                );
            }

            const accessToken = authorizationHeader.split(" ")[1];

            if (!accessToken) {
                throw new ApiError("Malformed token", StatusCodes.UNAUTHORIZED);
            }

            const tokenPayload = tokenService.verifyToken(
                accessToken,
                "access",
            );

            const isTokenExists = await tokenService.isTokenExists(accessToken);

            if (!isTokenExists) {
                throw new ApiError("Invalid token", StatusCodes.UNAUTHORIZED);
            }

            res.locals.tokenPayload = tokenPayload;

            next();
        } catch (e) {
            next(e);
        }
    }

    public async checkRefreshToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { refreshToken } = req.body as IRefresh;

            if (!refreshToken) {
                throw new ApiError(
                    "No refresh token provided",
                    StatusCodes.FORBIDDEN,
                );
            }

            const tokenPayload = tokenService.verifyToken(
                refreshToken,
                "refresh",
            );

            const isTokenExists =
                await tokenService.isTokenExists(refreshToken);

            if (!isTokenExists) {
                throw new ApiError("Invalid token", StatusCodes.FORBIDDEN);
            }

            res.locals.tokenPayload = tokenPayload;

            next();
        } catch (e) {
            next(e);
        }
    }
}

export const authMiddleware = new AuthMiddleware();
