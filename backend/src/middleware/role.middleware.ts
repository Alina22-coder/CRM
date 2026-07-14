import RoleEnum from "../enums/role.enum";
import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

class RoleMiddleware {
    public checkRole(...roles: RoleEnum[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            const { role } = res.locals.tokenPayload;

            if (!roles.includes(role)) {
                return next(
                    new ApiError(
                        "You do not have permission to perform this action",
                        StatusCodes.FORBIDDEN,
                    ),
                );
            }

            next();
        };
    }
}

export const roleMiddleware = new RoleMiddleware();
