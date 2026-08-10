import { Request, Response, NextFunction } from "express";
import { overdueSettingsService } from "../services/overdue-settings.service";
import StatusCodes from "../enums/status-codes.enum";

class OverdueSettingsController {
    public async getSettings(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data = await overdueSettingsService.getSettings();
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
            const data = await overdueSettingsService.updateSettings(
                req.body,
            );
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const overdueSettingsController = new OverdueSettingsController();
