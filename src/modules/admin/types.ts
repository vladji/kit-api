import { Types } from "mongoose";

export interface AdminProps {
  id: Types.ObjectId;
  uniqId: string;
  name: string;
  avatarUrl: string;
  disabled: boolean;
  chatEnabled: boolean;
  chatNotificationEnabled: boolean;
  credentials: {
    rootPassHash: string;
  };
}
