import { ChatMemberProps } from "./model/types";

interface Props {
  from: ChatMemberProps;
  to: ChatMemberProps;
}

export const composeChatId = ({ from, to }: Props) => {
  const [userA, userB] = [from.id, to.id].sort();
  return `chat-${userA.id}-${userB.id}`;
};
