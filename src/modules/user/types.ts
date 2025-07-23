import { Types } from "mongoose";

export enum UserRoles {
  Client = "client",
  Store = "store",
  Admin = "admin",
  RootAdmin = "root-admin"
}

interface DeviceDataProps {
  deviceManufacturer: string;
  deviceOs: string;
  deviceId: string;
}

export interface UserProps {
  type: UserRoles[];
  uniqueId: string;
  deviceData: DeviceDataProps;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  avatar?: string;
  stores?: Types.ObjectId[];
}
