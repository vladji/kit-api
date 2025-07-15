import { Request, Response } from "express";
import { UserModel } from "../user.model";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { UserProps } from "../types";

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

export const createUser = async (
  req: Request<{}, {}, UserProps>,
  res: Response
) => {
  const data = req.body;

  UserModel
    .create(data)
    .then((data) => {
      return res.status(201).json({ user: data });
    })
    .catch((err) => errorHandler(err, req, res));
};
