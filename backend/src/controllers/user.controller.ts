import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { userService } from "../services/user.service";
import { IUserQuery, IUserRegisterDTO } from "../interfaces/IUser";
import ApiError from "../errors/api.error";
import { ITokenPayload } from "../interfaces/IToken";
import RoleEnum from "../enums/role.enum";

class UserController {
    public async getAllUsers(_req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.query as IUserQuery;
            const data = await userService.getAllUsers(query);
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

    public async updateUserById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            const { userId, role } = res.locals.tokenPayload as ITokenPayload;

            if (role !== RoleEnum.Admin && id !== userId) {
                throw new ApiError(
                    "You can only edit your own profile",
                    StatusCodes.FORBIDDEN,
                );
            }

            const data = await userService.updateUserById(id, req.body);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async updateAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { userId, role } = res.locals.tokenPayload as ITokenPayload;

            if (role !== RoleEnum.Admin && id !== userId) {
                throw new ApiError(
                    "You can only edit your own profile",
                    StatusCodes.FORBIDDEN,
                );
            }

            if (!req.file) {
                throw new ApiError("No file uploaded", StatusCodes.BAD_REQUEST);
            }

            const data = await userService.updateAvatar(id, req.file.filename);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async banUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            if (id === userId) {
                throw new ApiError("You cannot ban yourself", StatusCodes.FORBIDDEN);
            }
            await userService.banUser(id);
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

    public async deleteUserById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            await userService.deleteUserById(id);
            res.status(StatusCodes.OK).json({ message: "User deleted" });
        } catch (e) {
            next(e);
        }
    }
}

export const userController = new UserController();
