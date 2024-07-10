import jwt from "jsonwebtoken";
import "dotenv/config";

const { SECRET_KEY_ACCESS, SECRET_KEY_REFRESH } = process.env;

export const createJWT = (payload) => {
  return jwt.sign(payload, SECRET_KEY_ACCESS, { expiresIn: "12h" });
};

export const createRefresh = (payload) => {
  return jwt.sign(payload, SECRET_KEY_REFRESH, { expiresIn: "15d" });
};

export const isValidJWT = (token) => {
  return jwt.verify(token, SECRET_KEY_ACCESS);
};

export const isValidRefresh = (token) => {
  return jwt.verify(token, SECRET_KEY_REFRESH);
};
