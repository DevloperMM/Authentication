import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { ApiError, generateTokenAndSetCookie } from "../lib/utils.js";
import sendEmail from "../mailer/mailer.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "../mailer/emailTemplates.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!(email && name && password))
      throw new ApiError(400, "All fields are required");

    const isUser = await User.findOne({ email });
    if (isUser) throw new ApiError(400, "This email is already registered");

    const hashPass = await bcryptjs.hash(password, 10);
    const otp = eval(process.env.VERITY_TOKEN);

    const user = await User.create({
      email,
      password: hashPass,
      name,
      verifyingToken: otp,
      verifyingTokenExpiry: Date.now() + eval(process.env.VERITY_TOKEN_EXPIRY),
    });

    generateTokenAndSetCookie(res, user._id);
    await sendEmail(
      "varshneyv506@gmail.com",
      "Verify your email",
      VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp)
    );

    return res.status(201).json({
      success: true,
      msg: "User registered",
      user: { ...user._doc, password: undefined },
    });
  } catch (err) {
    console.log(err);
    return res.status(err?.code || 500).json({
      success: false,
      msg: err?.msg || "Internal Server Error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verifyingToken: code,
      verifyingTokenExpiry: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Invalid or expired verification code");
    user.isVerified = true;
    user.verifyingToken = undefined;
    user.verifyingTokenExpiry = undefined;
    await user.save();

    await sendEmail(
      "varshneyv506@gmail.com",
      `Welcome ${user.name}`,
      WELCOME_EMAIL_TEMPLATE
    );

    return res.status(200).json({
      success: true,
      msg: "User verified",
      user: { ...user._doc, password: undefined },
    });
  } catch (err) {
    console.log(err);
    return res.status(err?.code || 500).json({
      success: false,
      msg: err?.msg || "Internal Server Error",
    });
  }
};

export const login = (req, res) => {};

export const logout = (req, res) => {};
