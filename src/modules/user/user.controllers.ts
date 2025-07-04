import { Request, Response } from "express";
import { UserModel } from "./user.model";
import { errorHandler } from "../../shared/middlewares/errorHandler";

//const user = await UserModel.findById(id).populate("storeId");

export const getUserByUniqueId = async (req: Request, res: Response) => {
  const uniqueId = req.query.uniqueId as string;

  UserModel
    .findOne({ uniqueId })
    .then(async (data) => {
      return res.status(200).json({ user: data });
    })
    .catch((err) => errorHandler(err, req, res));
};
