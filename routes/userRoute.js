import express from "express";
import validateBody from "../helpers/validateBody.js";
import { createUserSchema, loginUserSchema } from "../schemas/userSchema.js";

import {
  SignIn,
  SignUp,
  LogOut,
  refreshToken,
} from "../controllers/userController.js";
// import { refreshAuth } from "../middlewares/refreshAuth.js";
import { auth } from "../middlewares/authenticate.js";

const userRouter = express.Router();

userRouter.post("/register", validateBody(createUserSchema), SignUp);

userRouter.post("/login", validateBody(loginUserSchema), SignIn);

// userRouter.get("/refresh", refreshAuth, refreshToken);

userRouter.post("/logout", auth, LogOut);

export default userRouter;
