import mongoose from "mongoose";
import { StoreProps } from "./types";

const Schema = mongoose.Schema;

export type StoreDocument = Document & StoreProps;

const StoreWorkingTimeSchema = new Schema({
  weekDay: {
    type: String,
    enum: [
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ],
  },
  time: { type: String }
}, { _id: false });

const StoreContactsSchema = new Schema({
  phone: String,
  whatsApp: String,
  telegram: String,
  zalo: String,
  instagram: String,
  facebook: String,
}, { _id: false });

const ShowcaseSchema = new Schema({
  productName: { type: String, required: true },
  productImageUrl: [{ type: String, required: true }],
  productDescription: { type: String, required: true },
  productPrice: { type: Number, required: true },
  group: { type: String },
  subGroup: { type: String },
}, { _id: false });

const StoreSchema = new Schema<StoreDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user", // Название модели User
    index: true, // Для быстрого поиска по владельцу
    required: true,
  },
  storeName: { type: String, required: true },
  storeAvatarUrl: { type: String },
  storeImageUrl: [{ type: String, required: true }],
  workingTime: {
    type: [StoreWorkingTimeSchema],
  },
  contacts: StoreContactsSchema,
  showcases: [ShowcaseSchema],
}, {
  virtuals: true,
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const StoreModel = mongoose.model("store", StoreSchema);
