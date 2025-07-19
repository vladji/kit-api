import { Request, Response } from "express";
import { MessageModel } from "../model/message";
import { errorHandler } from "../../../shared/middlewares/errorHandler";

export const getMessages = (req: Request, res: Response) => {
  const chatId = req.query.chatId as string;

  if (!chatId) {
    res.status(400).json({ error: "chatId is required" });
  }

  MessageModel
    .find({ chatId })
    .sort({ createdAt: 1 })
    .then((messages) => {
      return res.status(200).json(messages);
    })
    .catch((err) => errorHandler(err, req, res));
};
