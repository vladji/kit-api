import { Request, Response } from "express";
import { UserModel } from "../user.model";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { UserProps } from "../types";

//const user = await UserModel.findById(id).populate("storeId");

export const getUserUniqueId = async (req: Request, res: Response) => {
  const uniqueId = req.query.uniqueId as string;

  UserModel
    .findOne({ uniqueId })
    .then(async (user) => {
      return res.status(200).json(user);
    })
    .catch((err) => errorHandler(err, req, res));
};

export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id;

  UserModel
    .findById(id)
    .then(async (user) => {
      return res.status(200).json(user);
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
    .then((user) => {
      return res.status(201).json(user);
    })
    .catch((err) => errorHandler(err, req, res));
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UserProps>,
  res: Response
) => {
  const id = req.params.id;
  const data = req.body;

  UserModel
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    })
    .catch((err) => errorHandler(err, req, res));
};
