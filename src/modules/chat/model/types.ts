import { Types } from "mongoose";
import { UserRoles } from "../../user/types";

export interface ChatMemberProps {
  id: Types.ObjectId;
  role: UserRoles;
}

export interface ChatProps {
  chatId: string;
  members: ChatMemberProps[];
  lastMessage: string,
  support?: boolean;
}

export interface MessageProps {
  chatId: string;
  from: Types.ObjectId;
  to: Types.ObjectId;
  text: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
