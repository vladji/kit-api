import mongoose from "mongoose";
import { UserProps } from "./types";

const Schema = mongoose.Schema;

export type StoreDocument = Document & UserProps;

const DeviceDataSchema = new Schema({
  deviceManufacturer: String,
  deviceOs: String,
  deviceId: String,
}, { _id: false });

const AdminSchema = new Schema({
  chatEnabled: { type: Boolean },
  chatNotificationEnabled: { type: Boolean },
}, { _id: false });

const UserSchema = new Schema<StoreDocument>({
  type: {
    type: String,
    required: true,
    enum: ["client", "store", "admin", "root-admin"],
  },
  uniqueId: { type: String, required: true },
  deviceData: DeviceDataSchema,
  name: { type: String },
  avatar: { type: String },
  admin: {
    type: AdminSchema,
    default: undefined
  },
  stores: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "store",
    }],
    default: undefined
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.type;
    }
  }
});

export const UserModel = mongoose.model("user", UserSchema);
