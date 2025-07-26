import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../../app/jwt/types";
import { UserRoles } from "../../modules/user/types";

const TOKEN_SECRET = process.env.TOKEN_SECRET!;

interface VerifyTokenProps {
  req: Request,
  res: Response,
  next: NextFunction
  isAdmin?: boolean,
  isStore?: boolean;
}

export const verifyToken = ({
  req,
  res,
  next,
  isAdmin,
  isStore
}: VerifyTokenProps) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: `Token not found` });
    return;
  }

  try {
    const payload = jwt.verify(token, TOKEN_SECRET) as TokenPayload;

    if (isAdmin) {
      const admin = !!payload.roles[UserRoles.Admin] || !!payload.roles[UserRoles.RootAdmin];
      if (!admin) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    if (isStore) {
      const store = !!payload.roles[UserRoles.Store];
      if (!store) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    res.status(403).json({ message: "Invalid token" });
    return;
  }
};
