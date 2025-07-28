import { Request, Response } from "express";
import { AdminModel } from "../admin.model";
import { errorHandler } from "../../../shared/middlewares/errorHandler";

export const getAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.adminId as string;
    const admin = await AdminModel.findById(adminId);
    res.status(200).json(admin);
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};
