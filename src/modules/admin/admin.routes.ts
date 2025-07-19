import express from "express";
import { adminLogin, refreshToken } from "./controllers/auth";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

const router = express.Router();

router.post("/admin/login", checkApiKey, adminLogin);
router.post("/admin/refresh-token", checkApiKey, refreshToken);

export default router;
