export interface ChatProps {
  chatId: string;
  members: string[];
  lastMessage: string,
}

export interface MessageProps {
  chatId: string;
  from: string;
  to: string;
  text: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
