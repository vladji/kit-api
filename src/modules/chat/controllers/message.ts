import { Request, Response } from "express";
import { MessageDTO, MessageModel } from "../model/message";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { Direction, MESSAGES_DEFAULT_LIMIT } from "../model/constants";
import mongoose from "mongoose";
import { toDTO, toDTOs } from "../../../shared/utils/toDTO";

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

const getMessagesAfter = async (
  chatId: string,
  messageId: string,
  limit: number
): Promise<MessageDTO[]> => {
  const objectId = new mongoose.Types.ObjectId(messageId);
  const docs = await MessageModel.find({
    chatId,
    _id: { $gt: objectId },
  })
    .sort({ _id: 1 })
    .limit(limit)
    .lean();
  return toDTOs(docs);
};

const getLatestMessages = async (
  chatId: string,
  limit: number
): Promise<MessageDTO[]> => {
  const docs = await MessageModel
    .find({ chatId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return toDTOs(docs);
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const limit = Math.max(
      MESSAGES_DEFAULT_LIMIT,
      parseInt(req.query.limit as string) || MESSAGES_DEFAULT_LIMIT
    );
    const chatId = req.query.chatId as string;
    const messageId = req.query.messageId as string;
    const direction = req.query.direction as Direction;

    if (!chatId) {
      res.status(400).json({ error: "chatId is required" });
    }

    let messages: MessageDTO[] | null = null;

    if (messageId && direction === Direction.Before) {
      messages = await getMessagesBefore(chatId, messageId, limit);
    }

    if (messageId && direction === Direction.After) {
      messages = await getMessagesAfter(chatId, messageId, limit);
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

export const getMessagesAroundFirstUnread = async (
  chatId: string,
  limitBefore = 50,
  limitAfter = 50
): Promise<{
  messagesAround: MessageDTO[],
  firstUnreadMessageId: string | null
}> => {
  const firstUnreadDoc = await MessageModel.findOne({
    chatId,
    read: false,
  })
    .sort({ _id: 1 })
    .lean();

  if (!firstUnreadDoc) {
    return {
      messagesAround: await getLatestMessages(chatId, limitBefore + limitAfter),
      firstUnreadMessageId: null,
    };
  }

  const firstUnread = toDTO(firstUnreadDoc) as MessageDTO;

  const objectId = new mongoose.Types.ObjectId(firstUnread.id);

  const beforeDocs = await MessageModel.find({
    chatId,
    _id: { $lt: objectId },
  })
    .sort({ _id: -1 })
    .limit(limitBefore)
    .lean();
  const before = toDTOs(beforeDocs).reverse() as MessageDTO[];

  const afterDocs = await MessageModel.find({
    chatId,
    _id: { $gte: objectId },
  })
    .sort({ _id: 1 })
    .limit(limitAfter + 1)
    .lean();
  const after = toDTOs(afterDocs) as MessageDTO[];

  return {
    messagesAround: [...after, ...before],
    firstUnreadMessageId: firstUnread.id,
  };
};

export const getMessagesAround = async (req: Request, res: Response) => {
  try {
    const limit = Math.max(
      MESSAGES_DEFAULT_LIMIT,
      parseInt(req.query.limit as string) || MESSAGES_DEFAULT_LIMIT
    );
    const chatId = req.query.chatId as string;

    const result = await getMessagesAroundFirstUnread(chatId, limit, limit);

    if (result) {
      res.status(200).json(result);
      return;
    }

    res.status(500).json({ error: "Failed to get messages" });

  } catch (err) {
    return errorHandler(err, req, res);
  }
};
