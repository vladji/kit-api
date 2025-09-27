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

export interface ChatProps {
  chatId: string;
  members: ChatMemberProps[];
  lastMessage: string,
  support?: SupportChatProps;
}

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
