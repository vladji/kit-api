import { Request, Response } from "express";
import { UserModel } from "../user.model";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { UserProps, UserPropsClient } from "../types";

//const user = await UserModel.findById(id).populate("storeId");

export const getUserByDbId = async (req: Request, res: Response) => {
  const id = req.query.id as string;

  UserModel
    .findById(id)
    .then(async (data) => {
      return res.status(200).json({ user: data });
    })
    .catch((err) => errorHandler(err, req, res));
};

export const getUserUniqueId = async (req: Request, res: Response) => {
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

export const updateUser = async (
  req: Request<{}, {}, UserPropsClient>,
  res: Response
) => {
  const { id, ...data } = req.body;

  UserModel
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ user: data });
    })
    .catch((err) => errorHandler(err, req, res));
};
