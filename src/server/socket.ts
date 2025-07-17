import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import { MessageModel } from "../modules/chat/model/message";
import { ChatDocument, ChatModel } from "../modules/chat/model/chat";
import { CustomSocket } from "./types";

const users = new Map();

export const registerSocketHandlers = (io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  io.on("connection", (socket: CustomSocket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("register", (userId: string) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ Registered user ${userId}`);
    });

    socket.on("private_message", async ({ from, to, text }) => {
      const [userA, userB] = [from, to].sort();
      const chatId = `chat-${userA}-${userB}`;

      try {
        let chat = await ChatModel.findOne<ChatDocument>({ chatId });

        if (!chat) {
          chat = await ChatModel.create({
            chatId,
            members: [userA, userB],
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
          console.error("❌ Chat error:", err.message, err.stack);
        } else {
          console.error("❌ Unknown error:", err);
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
};
