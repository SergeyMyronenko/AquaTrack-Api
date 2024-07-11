import HttpError from "../helpers/HttpError.js";
import { isValidRefresh } from "./isValidJWT.js";
import { User } from "../models/user.js";

export const refreshAuth = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(HttpError(401, "Unauthorized"));
  }

  try {
    const { id } = isValidRefresh(token);

    const user = await User.findById(id);

    if (!user?.refreshToken || user.refreshToken !== token) {
      next(HttpError(401, "Unauthorized"));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
