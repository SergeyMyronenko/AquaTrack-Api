import HttpError from "../helpers/HttpError.js";
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from "../services/googleOAuthClient.js";

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);

  const payload = loginTicket.getPayload();

  if (!payload) throw HttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: "parent",
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
