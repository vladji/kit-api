import { Request, Response } from "express";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { StoreModel } from "../store.model";

export const getStore = async (req: Request, res: Response) => {
  try {
    const storeId = req.query.storeId as string;
    const store = await StoreModel.findById(storeId);
    res.status(200).json(store);
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};
