import mongoose from "mongoose";
import "dotenv/config";
import config from "./config";
import { logger } from "./logger";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
};
export default connectDB;
