import { Request, Response } from "express";
import { MessageModel } from "../model/message";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { MESSAGES_DEFAULT_LIMIT } from "../model/constants";

const getLatestMessages = async (chatId: string, limit: number) => {
  return MessageModel
    .find({ chatId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const limit = Math.max(
      MESSAGES_DEFAULT_LIMIT,
      parseInt(req.query.limit as string) || MESSAGES_DEFAULT_LIMIT
    );
    const chatId = req.query.chatId as string;

    if (!chatId) {
      res.status(400).json({ error: "chatId is required" });
    }

    const messages = await getLatestMessages(chatId, limit);

    res.status(200).json(messages);
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};
