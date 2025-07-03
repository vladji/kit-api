import { Types } from "mongoose";

export interface UserProps {
  deviceId: string;
  storeId?: Types.ObjectId;
}
