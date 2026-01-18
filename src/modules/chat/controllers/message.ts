import { Request, Response } from "express";
import { MessageModel } from "../model/message";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { Direction, MESSAGES_DEFAULT_LIMIT } from "../model/constants";
import mongoose from "mongoose";
import { toDTO, toDTOs } from "../../../shared/utils/toDTO";
import { MessageDTO } from "../model/types";

const getMessagesBefore = async (
  chatId: string,
  messageId: string,
  limit: number
): Promise<MessageDTO[]> => {
  const objectId = new mongoose.Types.ObjectId(messageId);
  const docs = await MessageModel.find({
    chatId,
    _id: { $lt: objectId },
  })
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
  return toDTOs(docs).reverse();
};

async function getMessagesAfter(
  chatId: string,
  messageId: string,
  limit: number,
  includeCurrent: boolean = false,
): Promise<MessageDTO[]> {
  const objectId = new mongoose.Types.ObjectId(messageId);
  const docs = await MessageModel.find({
    chatId,
    _id: { [includeCurrent ? "$gte" : "$gt"]: objectId },
  })
    .sort({ _id: 1 })
    .limit(limit)
    .lean();
  return toDTOs(docs);
}

const getLatestMessages = async (
  chatId: string,
  limit: number
): Promise<MessageDTO[]> => {
  const docs = await MessageModel
    .find({ chatId })
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
  return toDTOs(docs).reverse();
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || MESSAGES_DEFAULT_LIMIT;
    const chatId = req.query.chatId as string;
    const messageId = req.query.messageId as string;
    const direction = req.query.direction as Direction;
    const includeCurrent = req.query.includeCurrent === "true";

    if (!chatId) {
      res.status(400).json({ error: "chatId is required" });
    }

    let messages: MessageDTO[] | null = null;

    if (messageId && direction === Direction.Before) {
      messages = await getMessagesBefore(chatId, messageId, limit);
    }

    if (messageId && direction === Direction.After) {
      messages = await getMessagesAfter(
        chatId,
        messageId,
        limit,
        includeCurrent,
      );
    }

    if (!messageId) {
      messages = await getLatestMessages(chatId, limit);
    }

    if (messages) {
      res.status(200).json(messages);
      return;
    }

    res.status(500).json({ error: "Failed to get messages" });
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};

export const getMessagesBeforeUnread = async (
  chatId: string,
  readerId: string,
  limit = MESSAGES_DEFAULT_LIMIT,
): Promise<{
  messagesAround: MessageDTO[],
  firstUnreadMessageId: string | null
}> => {
  const firstUnreadDoc = await MessageModel.findOne({
    chatId,
    to: readerId,
    read: false,
  })
    .sort({ _id: 1 })
    .lean();

  if (!firstUnreadDoc) {
    const messagesAround = await getLatestMessages(
      chatId,
      limit
    );

    return {
      messagesAround,
      firstUnreadMessageId: null,
    };
  }

  const firstUnread = toDTO(firstUnreadDoc) as MessageDTO;
  const before = await getMessagesBefore(chatId, firstUnread.id, limit);

  return {
    messagesAround: before,
    firstUnreadMessageId: firstUnread.id,
  };
};

export const getRecentlyMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.query.chatId as string;
    const readerId = req.query.readerId as string;
    const limit = parseInt(req.query.limit as string) || MESSAGES_DEFAULT_LIMIT;

    const result = await getMessagesBeforeUnread(
      chatId,
      readerId,
      limit,
    );

    if (result) {
      res.status(200).json(result);
      return;
    }

    res.status(500).json({ error: "Failed to get messages" });

  } catch (err) {
    return errorHandler(err, req, res);
  }
};
