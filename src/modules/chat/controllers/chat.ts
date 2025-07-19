import { Request, Response } from "express";
import { ChatModel } from "../model/chat";
import { errorHandler } from "../../../shared/middlewares/errorHandler";

export const getAllChats = async (req: Request, res: Response) => {
  const member = req.query.member;

  await ChatModel
    .find({ members: member })
    .sort({ updatedAt: -1 })
    .then((chats) => {
      return res.status(200).json(chats);
    })
    .catch((err) => errorHandler(err, req, res));
};

