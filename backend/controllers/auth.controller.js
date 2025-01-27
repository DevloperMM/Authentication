import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
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
      email,
      "Verify your email",
      VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp)
    );

    return res.status(201).json({
      success: true,
      message: "User registered",
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
      message: "User verified",
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

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "This email is not registered");

    const isPassValid = await bcryptjs.compare(password, user.password);
    if (!isPassValid) throw new ApiError(400, "Invalid credentials");

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Logged in",
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

export const logout = (req, res) => {
  return res.clearCookie("token").status(200).json({
    success: true,
    message: "User logged out",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "This email is not registered");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + eval(process.env.PASS_TOKEN_EXPIRY);

    user.resetPassToken = resetToken;
    user.resetPassTokenExpiry = resetTokenExpiry;

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await user.save();
    await sendEmail(
      email,
      "Forgot Password",
      PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl)
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.log(err);
    return res.status(err?.code || 500).json({
      success: false,
      msg: err?.msg || "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPassToken: token,
      resetPassTokenExpiry: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Invalid or expired reset token");

    const hashPass = await bcryptjs.hash(password, 10);
    user.password = hashPass;
    user.resetPassToken = undefined;
    user.resetPassTokenExpiry = undefined;

    await user.save();
    await sendEmail(
      user.email,
      "Reset Password Successful",
      PASSWORD_RESET_SUCCESS_TEMPLATE
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(err?.code || 500).json({
      success: false,
      msg: err?.msg || "Internal Server Error",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new ApiError(400, "User not found");

    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (err) {
    console.log(err);
    return res.status(err?.code || 500).json({
      success: false,
      msg: err?.msg || "Internal Server Error",
    });
  }
};
