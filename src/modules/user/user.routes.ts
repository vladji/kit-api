import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

import {
  createUser,
  getUserByDbId,
  getUserUniqueId,
  updateUser
} from "./controllers/profile";

const router = express.Router();

// PROFILE
router.get("/user/profile/db-id", checkApiKey, getUserByDbId);
router.post("/user/profile/db-id", checkApiKey, createUser);
router.post("/user/profile/update", checkApiKey, updateUser);

router.get("/user/profile/unique-id", checkApiKey, getUserUniqueId);

export default router;
