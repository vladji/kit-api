import { UserRoles } from "../../user/types";

export interface ChatMemberProps {
  id: string;
  role: UserRoles;
  name: string;
  avatarUrl: string | null;
}

export interface SupportChatProps {
  closed: boolean;
  admin?: ChatMemberProps;
}

export type UnreadCountProps = Map<string, number>;

export interface MessageProps {
  chatId: string;
  from: string;
  to: string;
  text: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  isInitialMessage?: boolean;
}

export interface ChatProps {
  chatId: string;
  members: ChatMemberProps[];
  unreadCount: UnreadCountProps;
  lastMessage: MessageProps,
  support?: SupportChatProps;
}

export type MessageDTO = MessageProps & {
  id: string;
}
