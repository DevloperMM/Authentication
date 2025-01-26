import { createTransport } from "nodemailer";
import { ApiError } from "../lib/utils.js";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (email, title, body) => {
  try {
    const transporter = createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "Developer",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    return info;
  } catch (err) {
    throw new ApiError(400, `Error sending mails: ${err}`);
  }
};

export default sendEmail;
