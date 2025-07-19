import mongoose from "mongoose";
import { UserProps } from "./types";

const Schema = mongoose.Schema;

export type StoreDocument = Document & UserProps;

const DeviceDataSchema = new Schema({
  deviceManufacturer: String,
  deviceOs: String,
  deviceId: String,
}, { _id: false });

const UserSchema = new Schema<StoreDocument>({
  type: { type: String, required: true, enum: ["client", "store"], },
  uniqueId: { type: String, required: true },
  deviceData: DeviceDataSchema,
  stores: [
    {
      type: Schema.Types.ObjectId,
      ref: "store",
    },
  ],
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
