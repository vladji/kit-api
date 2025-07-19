import mongoose from "mongoose";
import { ChatProps } from "./types";

export type ChatDocument = Document & ChatProps;

const ChatSchema = new mongoose.Schema<ChatDocument>({
  chatId: { type: String, required: true },
  members: [{ type: String, required: true }],
  lastMessage: { type: String, required: true },
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
