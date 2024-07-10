import HttpError from "../helpers/HttpError.js";
import { isValidJWT } from "./isValidJWT.js";
import { User } from "../models/user.js";

export const auth = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(HttpError(401, "Unauthorized"));
  }

  try {
    const { id } = isValidJWT(token);

    const user = await User.findById(id);

    if (!user.accessToken || user.accessToken !== token) {
      next(HttpError(401, "Unauthorized"));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
