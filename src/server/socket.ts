import { Server as SocketIOServer } from "socket.io";
import { MessageModel } from "../modules/chat/model/message";
import { ChatDocument, ChatModel } from "../modules/chat/model/chat";
import { CustomSocket } from "./types";
import { composeChatId } from "../modules/chat/utils";
import { httpServer } from "../app";
import { ORIGIN } from "../config/constants";

const users = new Map();

export const registerSocketHandlers = () => {
  try {
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket: CustomSocket) => {
      console.log("🔌 New client connected:", socket.id);

      socket.on("register", (userId: string) => {
        users.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ Registered user ${userId}`);
      });

      socket.on("private_message", async ({ from, to, text }) => {
        console.log("message", { from, to, text });
        const chatId = composeChatId({ from, to });

        try {
          let chat = await ChatModel.findOne<ChatDocument>({ chatId });

          if (!chat) {
            chat = await ChatModel.create({
              chatId,
              members: [from, to],
              lastMessage: text
            });
          }

          if (chat) {
            const message = await MessageModel.create({
              chatId: chat.chatId,
              from,
              to,
              text,
              read: false
            });

            await ChatModel.findOneAndUpdate({ chatId }, {
              lastMessage: text,
            });

            const toSocketId = users.get(to);
            if (toSocketId) {
              io.to(toSocketId).emit("private_message", message);
            }

            const fromSocketId = users.get(from);
            if (fromSocketId) {
              io.to(fromSocketId).emit("private_message", message);
            }
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error("❌ Chat error: ", err.message, err.stack);
          } else {
            console.error("❌ Unknown error: ", err);
          }

          const fromSocketId = users.get(from);
          if (fromSocketId) {
            io.to(fromSocketId).emit("chat_error", {
              message: "Unable to send message",
              details: err instanceof Error ? err.message : "Unknown error"
            });
          }
        }
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          users.delete(socket.userId);
          console.log(`❌ User ${socket.userId} disconnected`);
        }
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Chat error: ", err.message, err.stack);
    } else {
      console.error("❌ Unknown error: ", err);
    }
  }
};
