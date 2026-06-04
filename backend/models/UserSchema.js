import mongoose from "mongoose";
import { Role } from "../enums/role.enum.js";

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
    },
    surname: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.Admin,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    is_banned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

export default mongoose.model("User", UserSchema);
