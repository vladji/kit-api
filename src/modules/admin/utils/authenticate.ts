import { Response } from "express";
import { checkPassword } from "../../../shared/utils/crypto";
import {
  generateAccessToken,
  generateRefreshToken
} from "../../../shared/utils/token";
import { CookiesKeys } from "../../../config/constants";
import { UserRole } from "../../../types/admin";

interface AuthenticateProps {
  uniqId: string;
  password: string;
  passHash: string;
  roles: Partial<Record<UserRole, boolean>>;
  res: Response;
}

export const authenticate = async ({
  uniqId,
  password,
  passHash,
  roles,
  res
}: AuthenticateProps) => {
  const isValidPass = await checkPassword(password, passHash);

  if (!isValidPass) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken({ uniqId, roles });
  const refreshToken = generateRefreshToken({ uniqId, roles });

  res.cookie(CookiesKeys.refreshToken, refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/"
  });

  res.status(200).json({ accessToken });
};
