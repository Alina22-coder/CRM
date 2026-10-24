import mongoose from "mongoose";
import connectDB from "../config/db";
import { OrderModel } from "../models/order.model";
import { UserModel } from "../models/user.model";
import { logger } from "../config/logger";

const fixManagerRef = async () => {
    await connectDB();

    const surnames: string[] = await OrderModel.collection.distinct("manager", {
        manager: { $type: "string" },
    });

    for (const surname of surnames) {
        const user = await UserModel.findOne({ surname });

        if (!user) {
            logger.warn(`fix-manager-ref: user "${surname}" not found — skipped`);
            continue;
        }

        const res = await OrderModel.collection.updateMany(
            { manager: surname },
            { $set: { manager: user._id } },
        );

        logger.info(
            `fix-manager-ref: ${surname} → ${user._id}: orders ${res.modifiedCount}`,
        );
    }

    await mongoose.disconnect();
    process.exit(0);
};

fixManagerRef();
