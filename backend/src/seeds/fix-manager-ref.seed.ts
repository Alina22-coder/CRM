import mongoose from "mongoose";
import connectDB from "../config/db";
import { OrderModel } from "../models/order.model";
import { UserModel } from "../models/user.model";

const fixManagerRef = async () => {
    await connectDB();

    const surnames: string[] = await OrderModel.collection.distinct("manager", {
        manager: { $type: "string" },
    });

    for (const surname of surnames) {
        const user = await UserModel.findOne({ surname });

        if (!user) {
            console.log(`fix-manager-ref: user "${surname}" not found — skipped`);
            continue;
        }

        const res = await OrderModel.collection.updateMany(
            { manager: surname },
            { $set: { manager: user._id } },
        );

        console.log(
            `fix-manager-ref: ${surname} → ${user._id}: orders ${res.modifiedCount}`,
        );
    }

    await mongoose.disconnect();
    process.exit(0);
};

fixManagerRef();
