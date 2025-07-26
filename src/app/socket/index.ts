import { Server as SocketIOServer } from "socket.io";
import { CustomSocket, PrivateMessageProps } from "./types";
import { httpServer } from "../../app";
import { ORIGIN } from "../../config/constants";
import { createMessage, findChat, handleChatError, sendMessage } from "./utils";
import { AdminModel } from "../../modules/admin/admin.model";
import { socketAuthMiddleware } from "./authMiddleware";
import { Types } from "mongoose";
import { UserRoles } from "../../modules/user/types";

const users = new Map<Types.ObjectId, string>();

export const registerSocketHandlers = () => {
  try {
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.use(socketAuthMiddleware);

    io.on("connection", (socket: CustomSocket) => {
      console.log("🔌 New client connected:", socket.id);

      socket.on("register", (userId: Types.ObjectId) => {
        users.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ Registered user ${userId}`);
      });

      socket.on(
        "private_message",
        async ({ from, to, knownChatId, text }: PrivateMessageProps) => {
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

            if (to.role === UserRoles.Admin) {
              const { chatId, chat } = await findChat({
                from,
                to,
                lastMessage: text,
                support: true,
              });

              const message = await createMessage({ chatId, from, to, text });

              const admins = await AdminModel.find({
                disabled: false,
                chatEnabled: true,
              });

              for (const admin of admins) {
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

            const fromSocketId = users.get(from.id);
            if (fromSocketId) {
              io.to(fromSocketId).emit("chat_error", {
                message: "Unable to send message",
                details: err instanceof Error ? err.message : "Unknown error"
              });
            }
          }
        }
      );

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
