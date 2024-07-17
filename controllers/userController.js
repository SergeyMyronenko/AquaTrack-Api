import HttpError from "../helpers/HttpError.js";
import { User } from "../models/user.js";
import {
  createUser,
  findUserByEmail,
  validatePassword,
  updateUserWithToken,
  updateUserTokens,
} from "../services/userServices.js";

export const SignUp = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const isUser = await findUserByEmail(email);
    if (isUser) {
      throw HttpError(409, "User already exist");
    }

    await createUser({ email, password });

    const user = await findUserByEmail(email);

    const newUser = await updateUserWithToken(user._id);

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
    const { _id, name, email, avatarURL, gender, weight, activeTime, liters } =
      user;

    if (!user) {
      throw HttpError(401);
    }

    res.status(200).json({
      _id,
      name,
      email,
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
    if (limit) {
      result = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(selectedField);
    } else {
      result = await User.find().select(selectedField);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
