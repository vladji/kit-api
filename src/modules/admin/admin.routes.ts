import express from "express";
import { adminLogin } from "./controllers/auth";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";

const router = express.Router();

router.post("/admin/login", checkApiKey, adminLogin);

export default router;
