import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { requireAdmin } from "../../shared/middlewares/requireRole";
import express from "express";
import { getAllClientChats, getAllStoreChats } from "./middlewares";
import { getAdmin } from "./controllers/admin";

const router = express.Router();

router.get(
  "/admin/:adminId",
  checkApiKey,
  requireAdmin,
  getAdmin
);

router.get(
  "/admin/chats/all/clients",
  checkApiKey,
  requireAdmin,
  getAllClientChats
);

router.get(
  "/admin/chats/all/stores",
  checkApiKey,
  requireAdmin,
  getAllStoreChats
);

export default router;
