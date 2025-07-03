import express, { NextFunction, Response } from "express";
import { LoginRequest } from "./types";
import { adminLogin } from "./controllers/auth";
import { errorHandler } from "../../shared/middlewares/errorHandler";

const router = express.Router();

router.post(
  "/admin/login",
  async (req: LoginRequest, res: Response, next: NextFunction) => {
    try {
      const { uniqId } = req.body;
      if (uniqId === process.env.ADMIN_NAME) {
        return adminLogin(req, res);
      }

      res.status(403).json(
        { message: "You are not authorized to access this page" });
      return;
    } catch (err) {
      return errorHandler(err, req, res);
    }
  }
);

export default router;
