import mongoose from "mongoose";

import { AdminProps } from "./types";

export type AdminDocument = Document & AdminProps;

const AdminSchema = new mongoose.Schema<AdminDocument>({
  uniqId: {
    type: String,
    required: true,
    unique: true,
  },
  disabled: { type: Boolean, default: false },
  chatEnabled: { type: Boolean, default: true },
  chatNotificationEnabled: { type: Boolean, default: true },
  credentials: {
    rootPassHash: { type: String, required: true, },
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.credentials;
    }
  }
});

export const AdminModel = mongoose.model("admin", AdminSchema);
