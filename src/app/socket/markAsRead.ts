import {
  ChatUpdatedProps,
  MarkAsReadProps,
  MessagesUpdatedProps
} from "./types";
import { MessageModel } from "../../modules/chat/model/message";
import { ChatModel } from "../../modules/chat/model/chat";
import { AdminModel } from "../../modules/admin/admin.model";
import { handleChatError } from "./utils";

export async function markAsRead({
  io,
  userSockets,
  chatId,
  lastSeenMessageId,
  readerId,
  chatSupport,
  anyAdmin,
}: MarkAsReadProps) {
  try {
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

    // readerId может быть как ObjectId из mongo так и собственной канстантой типа 'chat_support'
    const chat = await ChatModel.findOneAndUpdate(
      { chatId },
      { $set: { [`unreadCount.${readerId}`]: unreadCount } },
      { new: true }
    );

    // const updatedChat = await ChatModel.findOneAndUpdate(
    //   {
    //     chatId,
    //     lastMessage: new mongoose.Types.ObjectId(lastSeenMessageId),
    //   },
    //   { $set: { "lastMessage.read": true }, },
    //   { new: true }
    // );

    // console.log("updatedChat", { updatedChat, lastSeenMessageId });

    // TODO: to hard expression (remove Error)
    if (!chat) {
      throw Error("Not found chat");
    }

    // const chatUpdatedData: ChatUpdatedProps = {
    //   chatId: updatedChat.chatId,
    // };
    const chatUpdatedData: ChatUpdatedProps = {
      chatId: chat.chatId,
    };

    const recipientUpdatedMessages: MessagesUpdatedProps = {
      chatId,
      readMessageIds,
    };

    const readerUpdatedMessages = {
      chatId,
      unreadCount,
    };

    // уведомляю отправителя, что его сообщение прочитано (docs[0].from может быть только обычным ObjectId из mongo)
    const recipientId = docs[0].from.toString();
    const recipientSockets = userSockets.get(recipientId) || [];
    recipientSockets.forEach((socketId) => {
      io.to(socketId)
        .emit("messages_updated", recipientUpdatedMessages);
      io.to(socketId).emit("chat_updated", chatUpdatedData);
    });

    // если я не админ (если я админ: readerId = 'chat_support') уведомляю себя, что сообщение мной прочитано
    if (chat && !anyAdmin) {
      const readerSockets = userSockets.get(readerId) || [];
      readerSockets.forEach((socketId) => {
        io.to(socketId).emit("messages_updated", readerUpdatedMessages);
        io.to(socketId).emit("chat_updated", chatUpdatedData);
      });
    }

    if (chatSupport) {
      const allAdmins = await AdminModel.find(
        { disabled: false, chatEnabled: true },
        { _id: 1 }
      ).lean();

      // если я админ, то уведомляю себя и всех остальных админов, что сообщение мной прочитано
      if (anyAdmin) {
        for (const admin of allAdmins) {
          const sockets = userSockets.get(admin._id.toString()) || [];
          sockets.forEach((socketId) => {
            io.to(socketId)
              .emit("messages_updated", readerUpdatedMessages);
            io.to(socketId).emit("chat_updated", chatUpdatedData);
          });
        }
      }

      //я не админ и уведомляю всех админов, кроме того с кем переписывался (тк его уже уведомил выше) что сообщение прочитано
      if (!anyAdmin) {
        const filteredAdmins = allAdmins.filter((admin) => admin._id.toString() !== recipientId);
        for (const admin of filteredAdmins) {
          const sockets = userSockets.get(admin._id.toString()) || [];
          sockets.forEach((socketId) => {
            io.to(socketId)
              .emit("messages_updated", recipientUpdatedMessages);
            io.to(socketId).emit("chat_updated", chatUpdatedData);
          });
        }
      }
    }
  } catch (err) {
    handleChatError(err);

    const fromSockets = userSockets.get(readerId);
    if (fromSockets) {
      fromSockets.forEach((socketId) => {
        io.to(socketId).emit("chat_error", {
          message: "Unable to 'mark as read' message",
          details: err instanceof Error ? err.message : "Unknown error"
        });
      });
    }
  }
}
