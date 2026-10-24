import express from "express";
import "dotenv/config";
import path from "path";
import connectDB from "./config/db.js";
import cors from "cors";
import router from "./routes/api.router.js";
import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import ApiError from "./errors/api.error";
import StatusCodes from "./enums/status-codes.enum";
import config from "./config/config";
import createAdmin from "./seeds/admin.seed.js";
import "./services/telegram.service";
import { startScheduler } from "./services/scheduler.service";
import { logger } from "./config/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
        setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    }),
);

app.use("/", router);

app.use((err: ApiError | MulterError, req: Request, res: Response, next: NextFunction) => {
    const status =
        err instanceof MulterError
            ? StatusCodes.BAD_REQUEST
            : err.status || 500;
    const message = err.message || "Internal Server Error";
    if (status >= 500) {
        logger.error(`${req.method} ${req.originalUrl}`, err);
    }
    res.status(status).json({ status, message });
});

process.on("uncaughtException", (err) => {
    logger.error("uncaughtException", err);
    process.exit(1);
});

const bootstrap = async () => {
    await connectDB();
    await createAdmin();
    startScheduler();

    app.listen(config.PORT, () => {
        logger.info(`Server is running on port ${config.PORT}`);
    });
};

bootstrap();
