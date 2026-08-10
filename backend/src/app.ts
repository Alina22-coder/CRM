import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import router from "./routes/api.router.js";
import { Request, Response, NextFunction } from "express";
import ApiError from "./errors/api.error";
import config from "./config/config";
import createAdmin from "./seeds/admin.seed.js";
import "./services/telegram.service";
import { startScheduler } from "./services/scheduler.service";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ status, message });
});

process.on("uncaughtException", (err) => {
    console.log("uncaughtException", err);
    process.exit(1);
});

const bootstrap = async () => {
    await connectDB();
    await createAdmin();
    startScheduler();

    app.listen(config.PORT, () => {
        console.log(`Server is running on port ${config.PORT}`);
    });
};

bootstrap();
