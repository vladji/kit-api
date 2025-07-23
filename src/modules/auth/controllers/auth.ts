import { Request, Response } from "express";
import { LoginRequest } from "../types";
import { AdminDocument, AdminModel } from "../../admin/admin.model";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { createAccessToken } from "../../../app/jwt/create";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../../../app/jwt/types";
import { authenticate } from "../utils/authenticate";
import { UserRoles } from "../../user/types";

const TOKEN_REFRESH_SECRET = process.env.TOKEN_REFRESH_SECRET!;

export const adminLogin = async (req: LoginRequest, res: Response) => {
  const { uniqId, password } = req.body;

  AdminModel
    .findOne({ uniqId: { $eq: uniqId } })
    .then(async (admin) => {
      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }

      const passHash = admin!.credentials!.rootPassHash;

      const { accessToken, refreshToken } = await authenticate({
        uniqId,
        password,
        passHash,
        roles: { [UserRoles.Admin]: true },
        res
      });

      if (!accessToken || !refreshToken) {
        return;
      }

      res.status(200).json({ admin, accessToken, refreshToken, success: true });
    })
    .catch((error) => errorHandler(error, req, res));
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Refresh token not found" });
    return;
  }

  try {
    const payload = jwt.verify(token, TOKEN_REFRESH_SECRET) as TokenPayload;

    if (payload.roles[UserRoles.Admin] || payload.roles[UserRoles.RootAdmin]) {
      const admin = await AdminModel.findOne<AdminDocument>({ uniqId: { $eq: payload.uniqId } });

      if (!admin || admin.disabled) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    const newAccessToken = createAccessToken({
      uniqId: payload.uniqId,
      roles: payload.roles,
      createdAt: Date.now(),
    });

    res.status(200).json({ accessToken: newAccessToken, success: true });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Refresh token expired" });
      return;
    }

    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// export const logout = async (req: Request, res: Response) => {
//   res.clearCookie(CookiesKeys.refreshToken, {
//     httpOnly: true,
//     sameSite: "strict",
//     secure: process.env.NODE_ENV !== "development",
//     path: "/"
//   });
//   res.sendStatus(200);
// };
