import mongoose from "mongoose";
import { MessageProps } from "./types";

const Schema = mongoose.Schema;

export type MessageDocument = Document & MessageProps;

export const MessageSchema = new Schema<MessageDocument>({
  chatId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  read: { type: Boolean },
  isInitialMessage: { type: Boolean },
}, {
  timestamps: true,
});

MessageSchema.index({ chatId: 1, _id: -1 });

export const MessageModel = mongoose.model<MessageDocument>(
  "message",
  MessageSchema
);
