import { Request, Response, NextFunction } from "express";
import { autoAssignService } from "../services/auto-assign.service";
import StatusCodes from "../enums/status-codes.enum";

class AutoAssignController {
    public async getSettings(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data = await autoAssignService.getSettings();
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async updateSettings(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data = await autoAssignService.updateSettings(req.body);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const autoAssignController = new AutoAssignController();
