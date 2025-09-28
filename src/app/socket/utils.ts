import { composeChatId } from "../../modules/chat/utils";
import { ChatDocument, ChatModel } from "../../modules/chat/model/chat";
import {
  MessageDocument,
  MessageModel
} from "../../modules/chat/model/message";
import { DefaultEventsMap, Server } from "socket.io";
import {
  ChatMemberProps,
  MessageProps,
  SupportChatProps
} from "../../modules/chat/model/types";
import { UserRoles } from "../../modules/user/types";
import { AdminModel } from "../../modules/admin/admin.model";
import { StoreModel } from "../../modules/store/store.model";
import { UserModel } from "../../modules/user/user.model";
import { ChatUpdatedProps, UserSocketMap } from "./types";
import { toDTO } from "../../shared/utils/toDTO";
import { CHAT_SUPPORT } from "../../modules/chat/model/constants";

interface FindMembersProps {
  to: ChatMemberProps;
  from: ChatMemberProps;
}

export const findMembers = async ({
  to,
  from
}: FindMembersProps): Promise<ChatMemberProps[]> => {
  const members: ChatMemberProps[] = [from];

  if (to.role === UserRoles.Admin) {
    const admins = await AdminModel
      .find(
        { disabled: false, chatEnabled: true },
        { _id: 1, name: 1 }
      )
      .lean();

    members.push(
      ...admins.map(({ _id, name }) => ({
        id: _id.toString(),
        role: UserRoles.Admin,
        name,
        avatarUrl: null,
      }))
    );
  }

  if (to.role === UserRoles.Store) {
    const store = await StoreModel.findById(to.id)
      .select("userId storeName storeAvatarUrl");

    if (!store) {
      throw new Error("Store not found");
    }

    const user = await UserModel.findById(store.userId).select("id");

    if (!user) {
      throw new Error("User not found");
    }

    members.push({
      id: user.id,
      role: UserRoles.Store,
      name: store.storeName,
      avatarUrl: store.storeAvatarUrl || null,
    });
  }

  if (to.role === UserRoles.Client) {
    const user = await UserModel.findById(to.id).select("publicName avatarUrl");

    if (!user) {
      throw new Error("User not found");
    }

    members.push({
      id: user.id,
      role: UserRoles.Client,
      name: user.publicName || "User",
      avatarUrl: user.avatarUrl || null,
    });
  }

  return members;
};

interface FindChatProps {
  lastMessage: string;
  from: ChatMemberProps;
  knownChatId: string | null;
  knownMembers?: ChatMemberProps[];
  support?: boolean;
}

export const findChat = async ({
  lastMessage,
  from,
  knownChatId,
  knownMembers,
  support
}: FindChatProps) => {
  const chatId = knownChatId ?? composeChatId(knownMembers);
  let members: ChatMemberProps[] | undefined = knownMembers;

  if (!members && knownChatId) {
    const existing = await ChatModel.findOne(
      { chatId: knownChatId },
      { members: 1 }
    );
    members = existing?.members;
  }

  const setOnInsert: Record<string, any> = {
    chatId,
    members: knownMembers,
  };

  if (support) {
    setOnInsert.support = {
      closed: false,
    };
  }

  if (from.role === UserRoles.Admin) {
    setOnInsert.support = {
      closed: false,
      admin: from,
    } as SupportChatProps;
  }

  const incUnread: Record<string, number> = {};
  // если сообщение в support и я не админ
  if (support && from.role !== UserRoles.Admin) {
    incUnread[`unreadCount.${CHAT_SUPPORT}`] = 1;
  } else {
    (members ?? []).forEach(member => {
      if (member.id !== from.id) {
        incUnread[`unreadCount.${member.id}`] = 1;
      }
    });
  }

  const chat = await ChatModel.findOneAndUpdate<ChatDocument>(
    { chatId },
    {
      $setOnInsert: setOnInsert,
      $inc: incUnread,
      lastMessage,
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  return {
    chatId,
    chat
  };
};

interface CreateMessageProps {
  chatId: string;
  from: ChatMemberProps;
  to: ChatMemberProps;
  text: string;
  isNewChat: boolean;
}

export const createMessage = async ({
  chatId,
  from,
  to,
  text,
  isNewChat,
}: CreateMessageProps) => {

  const newMessage: Omit<MessageProps, "createdAt" | "updatedAt"> = {
    chatId,
    from: from.id,
    to: to.id,
    text,
    read: false,
  };

  if (isNewChat) {
    newMessage.isInitialMessage = true;
  }

  const doc = await MessageModel.create(newMessage);
  return toDTO(doc.toObject());
};

interface SendMessageProps {
  userSockets: UserSocketMap;
  members: ChatMemberProps[];
  text: string;
  chat: ChatDocument;
  message: MessageDocument;
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}

export const sendMessage = async ({
  userSockets,
  members,
  text,
  chat,
  message,
  io
}: SendMessageProps) => {
  members.forEach((member) => {
    const sockets = userSockets.get(member.id);
    if (sockets) {
      sockets.forEach((socketId) => {
        const chatUpdatedData: ChatUpdatedProps = {
          chatId: chat.chatId,
          lastMessageText: text,
          updatedAt: message.createdAt,
          unreadCount: chat.unreadCount,
        };
        io.to(socketId).emit("private_message", message);
        io.to(socketId).emit("chat_updated", chatUpdatedData);
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
