import { Server as SocketIOServer } from "socket.io";
import { CustomSocket, PrivateMessageProps } from "./types";
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

    io.use(socketAuthMiddleware);

    io.on("connection", (socket: CustomSocket) => {
      console.log("🔌 New client connected:", socket.id);

      socket.on("register", (userId: string) => {
        users.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ Registered user ${userId}`);
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
              });

              const message = await createMessage({ chatId, from, to, text });

              await sendMessage({
                users,
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
                users,
                members: chat.members,
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
