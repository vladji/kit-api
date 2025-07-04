import jwt from "jsonwebtoken";
import { TokenPayload } from "../../types/token";

const TOKEN_SECRET = process.env.TOKEN_SECRET!;
const TOKEN_REFRESH_SECRET = process.env.TOKEN_REFRESH_SECRET!;

export const generateAccessToken = (data: TokenPayload) => {
  return jwt.sign(data, TOKEN_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (data: TokenPayload) => {
  return jwt.sign(data, TOKEN_REFRESH_SECRET, { expiresIn: "7d" });
};
