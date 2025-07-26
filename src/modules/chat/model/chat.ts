import mongoose from "mongoose";
import { ChatMemberProps, ChatProps } from "./types";

const Schema = mongoose.Schema;

type MemberDocument = Document & ChatMemberProps;
export type ChatDocument = Document & ChatProps;

const StoreContactsSchema = new Schema<MemberDocument>({
  id: { type: Schema.Types.ObjectId, required: true },
  role: {
    type: String,
    enum: ["store", "admin", "root-admin"],
    required: true,
  },
}, { _id: false });

const ChatSchema = new Schema<ChatDocument>({
  chatId: { type: String, required: true },
  members: { type: [StoreContactsSchema], required: true },
  lastMessage: { type: String, required: true },
  support: { type: Boolean }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const ChatModel = mongoose.model("chat", ChatSchema);
