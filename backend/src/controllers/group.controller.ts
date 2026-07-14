import { Request, Response, NextFunction } from "express";
import { groupService } from "../services/group.service";
import StatusCodes from "../enums/status-codes.enum";

class GroupController {
    public async getAllGroups(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await groupService.getAllGroups();
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async createGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;

            const data = await groupService.createGroup(name);

            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const groupController = new GroupController();
