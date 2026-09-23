import mongoose from "mongoose";
import connectDB from "../config/db";
import { OrderModel } from "../models/order.model";
import { HistoryModel } from "../models/history.model";

const RENAMES = [
    ["Aggre", "Agree"],
    ["Disaggre", "Disagree"],
] as const;

const fixStatusTypo = async () => {
    await connectDB();

    for (const [from, to] of RENAMES) {
        const orders = await OrderModel.updateMany(
            { status: from },
            { $set: { status: to } },
        );
        const oldValues = await HistoryModel.updateMany(
            { field: "status", old_value: from },
            { $set: { old_value: to } },
        );
        const newValues = await HistoryModel.updateMany(
            { field: "status", new_value: from },
            { $set: { new_value: to } },
        );

        console.log(
            `fix-status-typo: ${from} → ${to}: orders ${orders.modifiedCount}, history ${oldValues.modifiedCount + newValues.modifiedCount}`,
        );
    }

    await mongoose.disconnect();
    process.exit(0);
};

fixStatusTypo();
