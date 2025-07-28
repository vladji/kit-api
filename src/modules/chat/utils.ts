import { ChatMemberProps } from "./model/types";

export const composeChatId = (members?: ChatMemberProps[]) => {
  if (!members) {
    throw new Error("Unknown chat members");
  }

  const sorted = [...members].sort((a, b) =>
    a.id.toString().localeCompare(b.id.toString())
  );

  const string = sorted
    .map((member) => member.id.toString())
    .join("-");

  return `chat-${string}`;
};
