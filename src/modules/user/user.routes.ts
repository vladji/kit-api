import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

import { createUser, getUserByUniqueId } from "./controllers/profile";

const router = express.Router();

// PROFILE
router.get("/user/profile/unique-id", checkApiKey, getUserByUniqueId);
router.post("/user/profile/unique-id", checkApiKey, createUser);

export default router;
