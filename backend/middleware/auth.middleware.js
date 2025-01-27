import { ApiError } from "../lib/utils.js";
import jwt from "jsonwebtoken";

export const authProtect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new ApiError(401, "Unauthorized: No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) throw new ApiError(401, "Token forged or expired");

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(err?.code || 500)
      .json({ success: false, msg: err?.msg || "Error in checking Auth" });
  }
};
