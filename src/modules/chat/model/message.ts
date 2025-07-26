import mongoose from "mongoose";
import { MessageProps } from "./types";

const Schema = mongoose.Schema;

export type MessageDocument = Document & MessageProps;

const MessageSchema = new Schema<MessageDocument>({
  chatId: { type: String, required: true },
  from: { type: Schema.Types.ObjectId, required: true },
  to: { type: Schema.Types.ObjectId, required: true },
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
