import { ITokenPair, ITokenPayload } from "../interfaces/IToken";
import jwt from "jsonwebtoken";
import config from "../config/config";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

class TokenService {
    public generateToken(payload: ITokenPayload): ITokenPair {
        const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
            expiresIn: config.JWT_ACCESS_LIFETIME,
        });

        const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            expiresIn: config.JWT_REFRESH_LIFETIME,
        });

        return { accessToken, refreshToken };
    }

    public verifyToken(
        token: string,
        type: "access" | "refresh",
    ): ITokenPayload {
        try {
            let secret: string;

            switch (type) {
                case "access":
                    secret = config.JWT_ACCESS_SECRET;
                    break;
                case "refresh":
                    secret = config.JWT_REFRESH_SECRET;
                    break;
                default:
                    throw new ApiError(
                        "Invalid token type",
                        StatusCodes.BAD_REQUEST,
                    );
            }

            return jwt.verify(token, secret) as ITokenPayload;
        } catch (e) {
            throw new ApiError("Invalid token", StatusCodes.UNAUTHORIZED);
        }
    }
}

export const tokenService = new TokenService();
