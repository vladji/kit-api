import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getMessages, getRecentlyMessages } from "./controllers/message";
import { getMemberChats } from "./controllers/chat";

const router = express.Router();

router.get("/chats/member", checkApiKey, getMemberChats);
router.get("/chat/messages", checkApiKey, getMessages);
router.get("/chat/messages/recently", checkApiKey, getRecentlyMessages);

export default router;
