/// <reference path="./types/express/index.d.ts" />
import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import { errorHandler } from "./shared/middlewares/errorHandler";
import { server } from "./server";
import cookieParser from "cookie-parser";
import adminRoutes from "./modules/admin/admin.routes";

const URL_ORIGIN = process.env.URL_ORIGIN || "http://localhost:5173";

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // if req.body sent as form
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", URL_ORIGIN],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api", adminRoutes);

server();

app.use(errorHandler);

export default app;
