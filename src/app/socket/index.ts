import { Server as SocketIOServer } from "socket.io";
import { CustomSocket, PrivateMessageProps, UserSocketMap } from "./types";
import { httpServer } from "../../app";
import { ORIGIN } from "../../config/constants";
import {
  createMessage,
  findChat,
  findMembers,
  handleChatError,
  sendMessage
} from "./utils";
import { socketAuthMiddleware } from "./authMiddleware";
import { UserRoles } from "../../modules/user/types";

const userSockets: UserSocketMap = new Map();

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

      socket.on("register", (userId: string) => {
        if (!socket.admin) {
          socket.userId = userId;
        }

        if (socket.userId) {
          if (!userSockets.has(socket.userId)) {
            userSockets.set(socket.userId, new Set());
          }
          userSockets.get(socket.userId)!.add(socket.id);

          socket.join(`user:${socket.userId}`);
          console.log(`✅ Registered user ${socket.userId}`);
        }
      });

      socket.on(
        "private_message",
        async ({ from, to, knownChatId, text }: PrivateMessageProps) => {
          try {
            if (!knownChatId) {
              const members = await findMembers({ from, to });

              const supportChat = to.role === UserRoles.Admin || from.role === UserRoles.Admin;
              const { chatId, chat } = await findChat({
                from,
                lastMessage: text,
                knownMembers: members,
                support: supportChat,
                knownChatId,
              });

              const message = await createMessage({ chatId, from, to, text });

              await sendMessage({
                userSockets,
                members,
                text,
                chat,
                message,
                io
              });
            }

            if (knownChatId) {
              const supportChat = from.role === UserRoles.Admin;
              const { chatId, chat } = await findChat({
                from,
                lastMessage: text,
                knownChatId,
                support: supportChat,
              });

              const message = await createMessage({ chatId, from, to, text });

              await sendMessage({
                userSockets,
                members: chat.members,
                text,
                chat,
                message,
                io
              });
            }
          } catch (err) {
            handleChatError(err);

            const fromSockets = userSockets.get(from.id);
            if (fromSockets) {
              fromSockets.forEach((socketId) => {
                io.to(socketId).emit("chat_error", {
                  message: "Unable to send message",
                  details: err instanceof Error ? err.message : "Unknown error"
                });
              });
            }
          }
        }
      );

      socket.on("disconnect", () => {
        if (socket.userId && userSockets.has(socket.userId)) {
          const sockets = userSockets.get(socket.userId)!;
          sockets.delete(socket.id);

          if (sockets.size === 0) {
            userSockets.delete(socket.userId);
          }
          console.log(`🧹 Removed ${socket.id} for user ${socket.userId}, remaining: ${sockets.size}`);
        }
      });
    });
  } catch (err) {
    handleChatError(err);
  }
};
