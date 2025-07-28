import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

import {
  createUser,
  getUserById,
  getUserUniqueId,
  updateUser
} from "./controllers/profile";

const router = express.Router();

// PROFILE
router.get("/user/profile/unique/:uniqueId", checkApiKey, getUserUniqueId);

router.get("/user/profile/id/:id", checkApiKey, getUserById);
router.post("/user/profile/id", checkApiKey, createUser);
router.put("/user/profile/id/:id", checkApiKey, updateUser);

export default router;
