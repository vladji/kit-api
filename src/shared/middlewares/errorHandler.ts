import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  console.error("Caught error:", err);

  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? JSON.stringify(
      err.message) : undefined,
  });
};
