import express from "express";
import validateBody from "../helpers/validateBody.js";
import { createUserSchema, loginUserSchema } from "../schemas/userSchema.js";

import {
  SignIn,
  SignUp,
  LogOut,
  refreshToken,
  updatedUser,
  userCurrent,
  fetchAllUsers,
  googleAuth,
  googleRedirect,
} from "../controllers/userController.js";
import { refreshAuth } from "../middlewares/refreshAuth.js";
import { auth } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.js";

const userRouter = express.Router();

userRouter.post("/register", validateBody(createUserSchema), SignUp);

userRouter.get("/google", googleAuth);
userRouter.get("/google-redirect", googleRedirect)

userRouter.post("/login", validateBody(loginUserSchema), SignIn);

userRouter.get("/refresh", refreshAuth, refreshToken);

userRouter.post("/logout", auth, LogOut);

userRouter.put("/:userId", auth, upload.single("avatar"), updatedUser);

userRouter.get("/current", auth, userCurrent);

userRouter.get("/", fetchAllUsers);

export default userRouter;
