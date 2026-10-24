import config from "../config/config";
import RoleEnum from "../enums/role.enum";
import { UserModel } from "../models/user.model";
import { passwordService } from "../services/password.service";
import { logger } from "../config/logger";

const createAdmin = async () => {
    const admin = await UserModel.findOne({ email: config.ADMIN_EMAIL });

    if (admin) return;

    const hashedPassword = await passwordService.hashPassword(config.ADMIN_PASSWORD);

    await UserModel.create({
        email: config.ADMIN_EMAIL,
        password: hashedPassword,
        name: "Admin",
        surname: "",
        role: RoleEnum.Admin,
        is_active: true,
    });
    logger.info("Admin created successfully");
};

export default createAdmin;
