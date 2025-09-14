import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getMessages, getMessagesAround } from "./controllers/message";
import { getMemberChats } from "./controllers/chat";

const router = express.Router();

router.get("/chats/member", checkApiKey, getMemberChats);
router.get("/chat/messages", checkApiKey, getMessages);
router.get("/chat/messages/around", checkApiKey, getMessagesAround);

export default router;
