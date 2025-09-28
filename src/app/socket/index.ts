import { Server as SocketIOServer } from "socket.io";
import {
  ChatUpdatedProps,
  CustomSocket,
  MarkAsReadProps,
  PrivateMessageProps,
  UserSocketMap
} from "./types";
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
import { MessageModel } from "../../modules/chat/model/message";
import { AdminModel } from "../../modules/admin/admin.model";
import { ChatModel } from "../../modules/chat/model/chat";

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
        "mark_as_read",
        async ({
          chatId,
          lastSeenMessageId,
          readerId,
          chatSupport,
          anyAdmin,
        }: MarkAsReadProps) => {
          const docs = await MessageModel.find(
            {
              chatId,
              to: readerId,
              _id: { $lte: lastSeenMessageId },
              read: false,
            },
            { _id: 1, from: 1 }
          ).lean();

          if (!docs.length) return;

          const readMessageIds = docs.map((d) => d._id.toString());
          await MessageModel.updateMany(
            { _id: { $in: readMessageIds } },
            { $set: { read: true } }
          );

          const unreadCount = await MessageModel.countDocuments({
            chatId,
            to: readerId,
            read: false,
          });

          const chatUpdatedData: ChatUpdatedProps = {
            chatId,
            readMessageIds,
          };

          // уведомляю отправителя, что его сообщение прочитано (docs[0].from может быть только обычным ObjectId из mongo)
          const recipientId = docs[0].from.toString();
          const recipientSockets = userSockets.get(recipientId) || [];
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit("chat_updated", chatUpdatedData);
          });

          // readerId может быть как ObjectId из mongo так и собственной канстантой типа 'chat_support'
          const chat = await ChatModel.findOneAndUpdate(
            { chatId },
            { $set: { [`unreadCount.${readerId}`]: unreadCount } },
            { new: true }
          );

          // если я не админ (если я админ: readerId = 'chat_support') уведомляю себя, что сообщение мной прочитано
          if (chat && !anyAdmin) {
            const readerSockets = userSockets.get(readerId) || [];
            readerSockets.forEach((socketId) => {
              io.to(socketId).emit("chat_updated", {
                chatId,
                unreadCount: chat.unreadCount,
              });
            });
          }

          if (chatSupport) {
            const allAdmins = await AdminModel.find(
              { disabled: false, chatEnabled: true },
              { _id: 1 }
            ).lean();

            // если я админ, то уведомляю себя и всех остальных админов, что сообщение мной прочитано
            if (chat && anyAdmin) {
              for (const admin of allAdmins) {
                const sockets = userSockets.get(admin._id.toString()) || [];
                sockets.forEach((socketId) => {
                  io.to(socketId).emit("chat_updated", {
                    chatId,
                    unreadCount: chat.unreadCount,
                  });
                });
              }
            }

            //я не админ и уведомляю всех админов, кроме того с кем переписывался (тк его уже уведомил выше) что сообщение прочитано
            if (!anyAdmin) {
              const filteredAdmins = allAdmins.filter((admin) => admin._id.toString() !== recipientId);
              for (const admin of filteredAdmins) {
                const sockets = userSockets.get(admin._id.toString()) || [];
                sockets.forEach((socketId) => {
                  io.to(socketId).emit("chat_updated", chatUpdatedData);
                });
              }
            }
          }
        }
      );

      socket.on(
        "private_message",
        async ({ from, to, knownChatId, text }: PrivateMessageProps) => {
          const supportChat = to.role === UserRoles.Admin || from.role === UserRoles.Admin;

          try {
            if (!knownChatId) {
              const members = await findMembers({ from, to });

              const { chatId, chat } = await findChat({
                from,
                lastMessage: text,
                knownMembers: members,
                support: supportChat,
                knownChatId,
              });

              const message = await createMessage({
                chatId,
                from,
                to,
                text,
                isNewChat: true
              });

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
              const { chatId, chat } = await findChat({
                from,
                lastMessage: text,
                knownChatId,
                support: supportChat,
              });

              const message = await createMessage({
                chatId,
                from,
                to,
                text,
                isNewChat: false
              });

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
