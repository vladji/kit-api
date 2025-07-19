import mongoose from "mongoose";
import { MessageProps } from "./types";

export type MessageDocument = Document & MessageProps;

const MessageSchema = new mongoose.Schema<MessageDocument>({
  chatId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  read: { type: Boolean }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const MessageModel = mongoose.model("message", MessageSchema);
