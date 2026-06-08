interface IConfig {
    PORT: string;
    MONGODB_URI: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_LIFETIME: any;
    JWT_REFRESH_LIFETIME: any;
}

const config: IConfig = {
    PORT: process.env.PORT || "5000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/crm",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_ACCESS_LIFETIME: process.env.JWT_ACCESS_LIFETIME || "10m",
    JWT_REFRESH_LIFETIME: process.env.JWT_REFRESH_LIFETIME || "20m",
};

export default config;
