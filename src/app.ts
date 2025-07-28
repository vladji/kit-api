/// <reference path="./app/types/express/index.d.ts" />
import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import { errorHandler } from "./shared/middlewares/errorHandler";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import storeRoutes from "./modules/store/store.routes";
import userRoutes from "./modules/user/user.routes";
import chatRoutes from "./modules/chat/chat.router";
import rateLimit from "express-rate-limit";
import { ORIGIN } from "./config/constants";
import { createServer } from "http";
import { server } from "./app/server";

const app = express();
const httpServer = createServer(app);
export { httpServer };

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // if req.body sent as form
app.use(cookieParser());

app.use(cors({
  origin: ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 150,
  message: {
    status: 429,
    error: "Too many requests, please try again later"
  }
});

app.use("/api", limiter);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", storeRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", errorHandler);

server();

export default app;
