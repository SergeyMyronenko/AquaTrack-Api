import dotenv from 'dotenv';
dotenv.config();

import HttpError from "../helpers/HttpError.js";
import { User } from "../models/user.js";
import axios from "axios";
import { URL } from "url";
import queryString from "query-string";
import { sendMail } from "../helpers/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid"; // Правильний імпорт uuid

import {
  createUser,
  findUserByEmail,
  validatePassword,
  updateUserWithToken,
  updateUserTokens,
} from "../services/userServices.js";

const {
  BASE_URL,
  FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SECRET_KEY_ACCESS,
} = process.env;


export const SignUp = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const isUser = await findUserByEmail(email);
    if (isUser) {
      throw HttpError(409, "User already exist");
    }
    const verification = crypto.randomBytes(32).toString("hex");
    await createUser({ email, password, verificationToken: verification });

    const user = await findUserByEmail(email);

    const newUser = await updateUserWithToken(user._id);
    await sendMail(email, verification);
    res.status(201).json({
      user: {
        email,
      },
      token: newUser.accessToken,
      refreshToken: newUser.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const SignIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user.verify) {
      throw HttpError(401, "Please verify your email");
    }

    if (!user) {
      throw HttpError(401, "Email is wrong");
    }
    const isValidPassword = await validatePassword(password, user.password);
    if (!isValidPassword) {
      throw HttpError(401, "Password is wrong");
    }

    const newUser = await updateUserWithToken(user._id);

    res.status(200).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarURL,
        gender: newUser.gender,
        weight: newUser.weight,
        activeTime: newUser.activeTime,
        liters: newUser.liters,
      },
      token: newUser.accessToken,
      refreshToken: newUser.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const token = req.user.refreshToken;
  try {
    const { accessToken, refreshToken } = await updateUserTokens(token);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const LogOut = async (req, res, next) => {
  const { _id } = req.user;
  try {
    await updateUserWithToken(_id);

    res.status(204).json({
      message: "No content",
    });
  } catch (error) {
    next(error);
  }
};

export const updatedUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    let userData = req.body;

    if (req.file) {
      const avatarURL = req.file.path;
      userData.avatarURL = avatarURL;
    }

    const result = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    if (!result) {
      throw HttpError(404);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const userCurrent = async (req, res, next) => {
  const token = req.user.accessToken;

  try {
    const user = await User.findOne({ accessToken: token });
    const {
      _id,
      name,
      email,
      theme,
      avatarURL,
      gender,
      weight,
      activeTime,
      liters,
    } = user;
    console.log(user);
    if (!user) {
      throw HttpError(401);
    }

    res.status(200).json({
      _id,
      name,
      email,
      theme,
      avatarURL,
      gender,
      weight,
      activeTime,
      liters,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10);

    const selectedField = "avatarURL";

    let result;
    let totalUsers;

    if (limit) {
      result = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(selectedField);
    } else {
      result = await User.find().select(selectedField);
    }

    totalUsers = await User.countDocuments();

    res.status(200).json({ result, totalUsers });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BASE_URL}/api/users/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });

  console.log(
    "Redirecting to:",
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );
};


export const googleRedirect = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const urlObj = new URL(fullUrl);
    const urlParams = queryString.parse(urlObj.search);
    const code = urlParams.code;

    console.log("Received code:", code);

    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: "post",
      data: {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${BASE_URL}/api/users/google-redirect`,
        grant_type: "authorization_code",
        code,
      },
    });

    console.log("Token data:", tokenData.data);

    const userData = await axios({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      method: "get",
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });

    console.log("User data:", userData.data);

    const userName = userData.data.name;
    const userEmail = userData.data.email;

    let user = await User.findOne({ email: userEmail });

    if (user) {
      const token = jwt.sign({ id: user._id }, SECRET_KEY_ACCESS, {
        expiresIn: "48h",
      });

      await User.findByIdAndUpdate(user._id, { token });

      return res.redirect(`${FRONTEND_URL}/google-redirect?token=${token}`);
    }

    user = await User.create({
      email: userEmail,
      name: userName,
      password: uuidv4(),
    });

    const token = jwt.sign({ id: user._id }, SECRET_KEY_ACCESS, {
      expiresIn: "48h",
    });

    await User.findByIdAndUpdate(user._id, { token });

    res.redirect(`${FRONTEND_URL}/google-redirect?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during the authentication process");
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOneAndUpdate(
      { verificationToken },
      { verify: true, verificationToken: null },
      { new: true }
    );
    if (!user) throw HttpError(404);

    res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    next(error);
  }
};

export const verifyCheck = async (req, res, next) => {
  try {
    const { email } = req.body;

    const verification = crypto.randomBytes(32).toString("hex");

    const user = await User.findOneAndUpdate(
      { email, verify: false },
      { verificationToken: verification },
      { new: true }
    );
    if (!user) throw HttpError(400);

    await sendMail(email, verification);

    res.status(200).json({ message: "Verification email send" });
  } catch (error) {
    next(error);
  }
};
