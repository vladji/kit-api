import { Request } from "express";
import { LIMIT_ITEM_DEFAULT } from "./constants";

export const pagination = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(LIMIT_ITEM_DEFAULT, parseInt(req.query.limit as string) || LIMIT_ITEM_DEFAULT);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
};
