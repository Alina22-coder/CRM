import { Request, Response, NextFunction } from "express";
import { isObjectIdOrHexString } from "mongoose";
import ApiError from "../errors/api.error";

import { ObjectSchema } from "joi";
import StatusCodes from "../enums/status-codes.enum";
class CommonMiddleware {
    public isValidate(key: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = req.params[key];

                if (!isObjectIdOrHexString(id)) {
                    throw new ApiError(`Invalid id [${key}]`, 400);
                }
                next();
            } catch (e) {
                next(e);
            }
        };
    }

    public validateBody(validator: ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = await validator.validateAsync(req.body ?? {});
                next();
            } catch (e: unknown) {
                const err = e as { details?: { message: string }[] };
                next(new ApiError(err.details?.[0]?.message ?? "Validation error", 400));
            }
        };
    }

    public query(validator: ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                res.locals.query = await validator.validateAsync(req.query);
                next();
            } catch (e: unknown) {
                const err = e as { details?: { message: string }[]; message?: string };
                const message =
                    err.details?.[0]?.message ?? err.message ?? "Validation error";

                next(new ApiError(message, StatusCodes.BAD_REQUEST));
            }
        };
    }
}

export const commonMiddleware = new CommonMiddleware();
