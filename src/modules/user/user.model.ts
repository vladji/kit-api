import mongoose from "mongoose";
import { UserProps } from "./types";

const Schema = mongoose.Schema;

export type StoreDocument = Document & UserProps;

const UserSchema = new Schema<StoreDocument>({
  uniqueId: { type: String, required: true },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "store",
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const UserModel = mongoose.model("user", UserSchema);
