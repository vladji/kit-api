import { Types } from "mongoose";

export interface UserProps {
  uniqueId: string;
  storeId?: Types.ObjectId;
}
