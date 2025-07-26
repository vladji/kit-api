import { verifyToken } from "./verifyToken";
import { NextFunction, Request, Response } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) =>
  verifyToken({ req, res, next, isAdmin: true });
