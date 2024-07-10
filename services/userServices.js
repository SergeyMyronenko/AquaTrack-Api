import { User } from "../models/user.js";
import {
  createJWT,
  createRefresh,
  isValidRefresh,
} from "../middlewares/isValidJWT.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

export const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const createUser = async (userData) => {
  const newUser = new User(userData);
  await newUser.hashPasswords();
  await newUser.save();

  return newUser;
};

export const validatePassword = async (password, hash) => {
  const valid = await bcrypt.compare(password, hash);
  return valid;
};

export const updateUserWithToken = async (id) => {
  const accessToken = createJWT({ id });
  const refreshToken = createRefresh({ id });

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { accessToken: accessToken, refreshToken: refreshToken },
    { new: true }
  );

  return updatedUser;
};

export const updateUserTokens = async (token) => {
  const { id } = isValidRefresh(token);
  const accessToken = createJWT({ id });
  const refreshToken = createRefresh({ id });
  const tokens = { accessToken, refreshToken };

  await User.findByIdAndUpdate(
    id,
    { accessToken, refreshToken },
    { new: true }
  );

  return tokens;
};
