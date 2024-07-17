import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatarURL: {
      type: String,
      default:
        "https://res.cloudinary.com/dcwgkbucu/image/upload/v1721217036/aquq-track/default-icon.svg",
    },
    gender: {
      type: String,
      enum: ["man", "woman"],
      default: null,
    },
    weight: {
      type: Number,
      default: 0,
    },
    activeTime: {
      type: Number,
      default: 0,
    },
    liters: {
      type: Number,
      default: 0,
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.hashPasswords = async function () {
  this.password = await bcrypt.hash(this.password, 10);
};

export const User = model("user", userSchema);
