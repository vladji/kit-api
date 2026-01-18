import { Socket } from "socket.io";
import { AdminProps } from "../../modules/admin/types";
import {
  ChatMemberProps,
  UnreadCountProps
} from "../../modules/chat/model/types";

export type TSocketIOServer = import("socket.io").Server;

export interface BaseSocketProps {
  io: TSocketIOServer;
  userSockets: UserSocketMap;
}

export interface CustomSocket extends Socket {
  userId?: string;
  admin?: AdminProps;
}

export enum SocketError {
  TokenExpired = "token_expired",
  InvalidToken = "invalid_token",
  AdminNotFound = "admin_not_found",
  AccessDenied = "access_denied",
  InternalError = "internal_error",
}

export interface PrivateMessageProps {
  from: ChatMemberProps;
  to: ChatMemberProps;
  text: string;
  knownChatId: string | null;
}

export interface MessageMetaProps {
  unreadCount: UnreadCountProps;
}

export interface ChatUpdatedProps {
  chatId: string;
  lastMessageText?: string;
  updatedAt?: Date;
  unreadCount?: UnreadCountProps;
}

export interface MessagesUpdatedProps {
  chatId: string;
  unreadCount?: UnreadCountProps;
  readMessageIds?: string[];
}

export interface MarkAsReadProps extends BaseSocketProps {
  chatId: string;
  lastSeenMessageId: string;
  readerId: string;
  chatSupport: boolean;
  anyAdmin: boolean;
}

export type UserSocketMap = Map<string, Set<string>>;
