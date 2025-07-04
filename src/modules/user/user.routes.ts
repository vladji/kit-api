import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getUserByUniqueId } from "./user.controllers";

const router = express.Router();

router.get("/user/profile/unique-id", checkApiKey, getUserByUniqueId);

export default router;
