import { Request, Response } from "express";
import { MessageModel } from "../model/message";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { pagination } from "../../../shared/utils/pagination";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const {
      page, limit, skip
    } = pagination(req);

    const chatId = req.query.chatId as string;

    if (!chatId) {
      res.status(400).json({ error: "chatId is required" });
    }

    const [messages, total] = await Promise.all([
      MessageModel
        .find({ chatId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      MessageModel.countDocuments({ chatId })
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      messages,
    });
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};
