import { Request, Response } from "express";
import { ChatModel } from "../model/chat";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { pagination } from "../../../shared/utils/pagination";

export const getMemberChats = async (req: Request, res: Response) => {
  try {
    const {
      page, limit, skip
    } = pagination(req);

    const memberId = req.query.memberId as string;
    const isSupport = req.query.support === "true";

    const filter: any = {
      "members.id": memberId,
    };

    if (isSupport) {
      filter.support = { $exists: true };
    }

    const [chats, total] = await Promise.all([
      ChatModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatModel.countDocuments(filter),
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



