import express from "express";
import { adminLogin, refreshToken } from "./controllers/auth";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

const router = express.Router();


router.post("/auth/admin/login", checkApiKey, adminLogin);
router.post("/auth/refresh-token", checkApiKey, refreshToken);

export default router;
