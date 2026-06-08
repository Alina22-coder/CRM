import config from "../config/config";
import RoleEnum from "../enums/role.enum";
import { UserModel } from "../models/user.model";
import { passwordService } from "../services/password.service";

const createAdmin = async () => {
    const admin = await UserModel.findOne({ email: config.ADMIN_EMAIL });

    if (admin) return;

    const hashedPassword = await passwordService.hashPassword("admin");

    await UserModel.create({
        email: config.ADMIN_EMAIL,
        password: hashedPassword,
        role: RoleEnum.Admin,
        is_active: true,
    });
    console.log("Admin created successfully");
};

export default createAdmin;
