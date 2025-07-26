import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getAllSupportChats, getMemberAllChats } from "./controllers/chat";
import { getMessages } from "./controllers/message";
import { requireAdmin } from "../../shared/middlewares/requireRole";

const router = express.Router();

router.get(
  "/chat/admin/all-support",
  checkApiKey,
  requireAdmin,
  getAllSupportChats
);
router.get("/chat/member/all-chats", checkApiKey, getMemberAllChats);
router.get("/chat/messages", checkApiKey, getMessages);

export default router;
