import express from "express";
import { checkApiKey } from "../../../shared/middlewares/checkApiKey";
import { getMessages } from "../controllers/message";

const router = express.Router();

router.get("/chat/messages", checkApiKey, getMessages);

export default router;
