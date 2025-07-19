interface Props {
  from: string;
  to: string;
}

export const composeChatId = ({ from, to }: Props) => {
  const [userA, userB] = [from, to].sort();
  return `chat-${userA}-${userB}`;
};
