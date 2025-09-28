import mongoose from "mongoose";
import { ChatMemberProps, ChatProps, SupportChatProps } from "./types";

const Schema = mongoose.Schema;

export type MemberDocument = Document & ChatMemberProps;
type SupportDocument = Document & SupportChatProps;
export type ChatDocument = Document & ChatProps;

const MemberSchema = new Schema<MemberDocument>({
  id: { type: String, required: true },
  role: {
    type: String,
    enum: ["store", "admin", "root-admin"],
    required: true,
  },
  name: { type: String, required: true },
  avatarUrl: { type: String },
}, { _id: false });

const UnreadCountSchema = {
  type: Map,
  of: Number,
  default: {}
};

const SupportSchema = new Schema<SupportDocument>({
  closed: { type: Boolean, required: true },
  admin: { type: MemberSchema },
}, { _id: false });

const ChatSchema = new Schema<ChatDocument>({
  chatId: { type: String, required: true },
  members: { type: [MemberSchema], required: true },
  unreadCount: UnreadCountSchema,
  lastMessage: { type: String, required: true },
  support: { type: SupportSchema }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const ChatModel = mongoose.model("chat", ChatSchema);
