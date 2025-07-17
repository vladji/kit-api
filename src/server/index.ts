import app from "../app";
import { connectToDB } from "./db";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ORIGIN } from "../config/constants";
import { registerSocketHandlers } from "./socket";

const PORT = 3001;

export const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

export const server = async () => {
  await connectToDB();
  registerSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};
