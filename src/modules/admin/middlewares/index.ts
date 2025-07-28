import { Request, Response } from "express";
import { getAllChats } from "../controllers/chats";
import { UserRoles } from "../../user/types";

export const getAllClientChats = async (req: Request, res: Response) => {
  return getAllChats({ req, res, role: UserRoles.Client });
};

export const getAllStoreChats = async (req: Request, res: Response) => {
  return getAllChats({ req, res, role: UserRoles.Store });
};
