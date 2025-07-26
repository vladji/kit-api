import { Response } from "express";
import { checkPassword } from "../../../app/crypto/checkPassword";
import { createAccessToken, createRefreshToken } from "../../../app/jwt/create";
import { TokenUserRoles } from "../../../app/jwt/types";
import { UserRoles } from "../../user/types";
import { Types } from "mongoose";

const ROOT_ADMIN = process.env.ROOT_ADMIN_NAME!;

interface AuthenticateProps {
  id: Types.ObjectId;
  uniqId: string;
  password: string;
  passHash: string;
  roles: TokenUserRoles;
  res: Response;
}

export const authenticate = async ({
  id,
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

  const rolesObj = {
    ...roles,
  };

  if (uniqId === ROOT_ADMIN) {
    rolesObj[UserRoles.RootAdmin] = true;
  }

  const accessToken = createAccessToken({
    id,
    uniqId,
    roles: rolesObj,
    createdAt: Date.now(),
  });

  const refreshToken = createRefreshToken({
    id,
    uniqId,
    roles: rolesObj,
    createdAt: Date.now(),
  });

  return {
    accessToken,
    refreshToken
  };
};
