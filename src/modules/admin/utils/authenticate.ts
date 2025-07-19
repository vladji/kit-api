import { Response } from "express";
import { checkPassword } from "../../../app/crypto";
import { createAccessToken, createRefreshToken } from "../../../app/jwt/create";
import { TokenUserRoles } from "../../../app/jwt/types";
import { UserRoles } from "../../user/types";

const ROOT_ADMIN = process.env.ROOT_ADMIN_NAME!;

interface AuthenticateProps {
  uniqId: string;
  password: string;
  passHash: string;
  roles: TokenUserRoles;
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

  const adminRole: TokenUserRoles = uniqId === ROOT_ADMIN ? { [UserRoles.RootAdmin]: true } : roles;

  const accessToken = createAccessToken({ uniqId, roles: adminRole });
  const refreshToken = createRefreshToken({ uniqId, roles: adminRole });

  res.status(200).json({ accessToken, refreshToken });
};
