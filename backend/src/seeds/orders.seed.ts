import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "../config/db";
import { OrderModel } from "../models/order.model";
import { logger } from "../config/logger";

type DumpOrder = Record<string, unknown> & {
    email?: string | null;
    created_at?: string | Date | null;
};

const seedOrders = async () => {
    await connectDB();

    const dumpPath = path.resolve(__dirname, "../../../dump/orders.dump");
    const raw = fs.readFileSync(dumpPath, "utf-8");

    const match = raw.match(/db\.orders\.insertMany\((\[[\s\S]*\])\)/);
    if (!match) {
        logger.error("orders.seed: could not parse dump file");
        process.exit(1);
    }

    const dumpOrders: DumpOrder[] = (JSON.parse(match[1]) as DumpOrder[]).map(
        (order) => ({
            ...order,
            created_at: order.created_at
                ? new Date(order.created_at)
                : order.created_at,
        }),
    );

    const existingEmails = await OrderModel.distinct("email");
    const existingSet = new Set(existingEmails.filter(Boolean));

    const toInsert =
        existingSet.size === 0
            ? dumpOrders
            : dumpOrders.filter((o) => o.email && !existingSet.has(o.email));

    if (toInsert.length === 0) {
        logger.info("orders.seed: nothing to insert, all orders already exist");
    } else {
        await OrderModel.insertMany(toInsert, { ordered: false });
        logger.info(`orders.seed: inserted ${toInsert.length} orders`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

seedOrders();
