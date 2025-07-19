import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getAllChats } from "./controllers/chat";
import { getMessages } from "./controllers/message";

const router = express.Router();

router.get("/chat/all-chats", checkApiKey, getAllChats);
router.get("/chat/messages", checkApiKey, getMessages);

export default router;
