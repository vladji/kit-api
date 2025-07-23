import { Response } from "express";
import { checkPassword } from "../../../app/crypto/checkPassword";
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
    res.status(401).json({ message: "Invalid credentials" });
    return {
      accessToken: null,
      refreshToken: null,
    };
  }

  const adminRole: TokenUserRoles = uniqId === ROOT_ADMIN ? { [UserRoles.RootAdmin]: true } : roles;

  const accessToken = createAccessToken({
    uniqId,
    roles: adminRole,
    createdAt: Date.now(),
  });

  const refreshToken = createRefreshToken({
    uniqId,
    roles: adminRole,
    createdAt: Date.now(),
  });

  return {
    accessToken,
    refreshToken
  };
};
