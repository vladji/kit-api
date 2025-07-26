import { NextFunction, Request, Response } from "express";

const API_KEY = process.env.API_KEY;

export const checkApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientKey = req.headers["x-api-key"];
  if (clientKey !== API_KEY) {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};
