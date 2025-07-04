import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../../types/token";

const TOKEN_SECRET = process.env.TOKEN_SECRET!;

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: `Token not found` });
    return;
  }

  try {
    req.user = jwt.verify(token, TOKEN_SECRET) as TokenPayload;
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
