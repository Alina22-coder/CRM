import bcrypt from "bcryptjs";

class PasswordService {
    public hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    public comparePassword(
        password: string,
        hashPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashPassword);
    }
}

export const passwordService = new PasswordService();
