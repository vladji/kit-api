import { Request, Response } from "express";
import { ChatModel } from "../model/chat";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { pagination } from "../../../shared/utils/pagination";

export const getMemberAllChats = async (req: Request, res: Response) => {
  try {
    const {
      page, limit, skip
    } = pagination(req);

    const memberId = req.query.memberId;

    const [chats, total] = await Promise.all([
      ChatModel
        .find({ "members.id": memberId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatModel.countDocuments({ "members.id": memberId }),
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      chats,
    });
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};

export const getAllSupportChats = async (req: Request, res: Response) => {
  try {
    const {
      page, limit, skip
    } = pagination(req);

    const [chats, total] = await Promise.all([
      ChatModel
        .find({ support: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatModel.countDocuments({ support: true }),
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      chats,
    });
    return;
  } catch (err) {
    return errorHandler(err, req, res);
  }
};

