import { composeChatId } from "../modules/chat/utils";
import { ChatDocument, ChatModel } from "../modules/chat/model/chat";
import { MessageDocument, MessageModel } from "../modules/chat/model/message";
import { DefaultEventsMap, Server } from "socket.io";
import { Types } from "mongoose";

interface FindChatProps {
  from: string;
  to: string;
  lastMessage: string;
  knownChatId?: string;
  support?: boolean;
}

export const findChat = async ({
  from,
  to,
  lastMessage,
  knownChatId,
  support
}: FindChatProps) => {
  const chatId = knownChatId ?? composeChatId({ from, to });

  const setOnInsert: Record<string, any> = {
    chatId,
    members: [from, to],
  };

  if (typeof support === "boolean") {
    setOnInsert.support = support;
  }

  const chat = await ChatModel.findOneAndUpdate(
    { chatId },
    {
      $setOnInsert: setOnInsert,
      lastMessage,
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  return { chatId, chat };
};

interface CreateMessageProps {
  chatId: string;
  from: string;
  to: string;
  text: string;
}

export const createMessage = async ({
  chatId,
  from,
  to,
  text
}: CreateMessageProps) => {
  return await MessageModel.create({
    chatId,
    from,
    to,
    text,
    read: false,
  });
};

interface SendMessageProps {
  users: Map<Types.ObjectId, string>;
  from: Types.ObjectId;
  to: Types.ObjectId;
  text: string;
  chat: ChatDocument;
  message: MessageDocument;
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}

export const sendMessage = async ({
  users,
  from,
  to,
  text,
  chat,
  message,
  io
}: SendMessageProps) => {
  [from, to].forEach((userId) => {
    const socketId = users.get(userId);
    if (socketId) {
      io.to(socketId).emit("private_message", message);
      io.to(socketId).emit("chat_updated", {
        chatId: chat.chatId,
        lastMessage: text,
        updatedAt: message.createdAt,
      });
    }
  });
};

export const handleChatError = (err: unknown) => {
  if (err instanceof Error) {
    console.error("❌ Chat error: ", err.message, err.stack);
  } else {
    console.error("❌ Unknown error: ", err);
  }
};
