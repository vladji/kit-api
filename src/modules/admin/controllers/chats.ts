import { Request, Response } from "express";
import { pagination } from "../../../shared/utils/pagination";
import { ChatModel } from "../../chat/model/chat";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { UserRoles } from "../../user/types";

interface GetAllChatsProps {
  req: Request,
  res: Response,
  role: UserRoles,
}

export const getAllChats = async ({ req, res, role }: GetAllChatsProps) => {
  try {
    const {
      page, limit, skip
    } = pagination(req);

    const [chats, total] = await Promise.all([
      ChatModel
        .find({
          support: { $exists: true },
          members: {
            $elemMatch: { role }
          }
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatModel.countDocuments({
        support: { $exists: true },
        members: {
          $elemMatch: { role }
        }
      }),
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
