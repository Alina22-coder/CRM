import mongoose from "mongoose";
import "dotenv/config";
import config from "./config";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
};
export default connectDB;
