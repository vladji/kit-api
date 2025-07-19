import { Server as SocketIOServer } from "socket.io";
import { CustomSocket } from "./types";
import { httpServer } from "../app";
import { ORIGIN } from "../config/constants";
import { CHAT_SUPPORT } from "./constants";
import { UserModel } from "../modules/user/user.model";
import { UserRoles } from "../modules/user/types";
import { createMessage, findChat, handleChatError, sendMessage } from "./utils";

const users = new Map<string, string>();

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

      socket.on("private_message", async ({ from, to, knownChatId, text }) => {
        try {
          if (knownChatId) {
            const { chatId, chat } = await findChat({
              from,
              to,
              lastMessage: text,
              knownChatId
            });

            const message = await createMessage({ chatId, from, to, text });

            await sendMessage({
              users,
              from,
              to,
              text,
              chat,
              message,
              io
            });

            return;
          }

          if (to === CHAT_SUPPORT) {
            const { chatId, chat } = await findChat({
              from,
              to,
              lastMessage: text
            });

            const message = await createMessage({ chatId, from, to, text });

            const admins = await UserModel.find({
              role: { $in: [UserRoles.Admin, UserRoles.RootAdmin] },
              "admin.chatEnabled": true,
            });

            for (const admin of admins) {
              const toAdmin = admin.id.toString();
              await sendMessage({
                users,
                from,
                to: toAdmin,
                text,
                chat,
                message,
                io
              });
            }
          } else {
            const { chatId, chat } = await findChat({
              from,
              to,
              lastMessage: text
            });

            const message = await createMessage({ chatId, from, to, text });

            await sendMessage({
              users,
              from,
              to,
              text,
              chat,
              message,
              io
            });
          }
        } catch (err) {
          handleChatError(err);

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
    handleChatError(err);
  }
};
