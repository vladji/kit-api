import express from "express";
import { checkApiKey } from "../../shared/middlewares/checkApiKey";
import { getStore } from "./controllers/store";

const router = express.Router();

router.get("/store/:storeId", checkApiKey, getStore);

export default router;
