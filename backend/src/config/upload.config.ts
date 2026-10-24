import fs from "fs";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};
const ALLOWED_MIME_TYPES = Object.keys(EXTENSION_BY_MIME_TYPE);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString("hex");
        cb(null, `${uniqueName}${EXTENSION_BY_MIME_TYPE[file.mimetype]}`);
    },
});

export const avatarUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(
                new ApiError(
                    "Only JPEG, PNG, and WEBP images are allowed",
                    StatusCodes.BAD_REQUEST,
                ),
            );
            return;
        }
        cb(null, true);
    },
});

export const AVATAR_URL_PREFIX = "/uploads/avatars";
