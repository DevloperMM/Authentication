import jwt from "jsonwebtoken";

export class ApiError extends Error {
  constructor(code, msg = "Some Error occured", errors = [], stack = "") {
    super(msg);
    this.success = false;
    this.code = code;
    this.msg = msg;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function generateTokenAndSetCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: eval(process.env.COOKIE_EXPIRY),
  });
}
