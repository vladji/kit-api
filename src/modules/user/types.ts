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
  uniqueId: string;
  deviceData: DeviceDataProps;
  createdAt: Date;
  updatedAt: Date;
  publicName?: string;
  avatarUrl?: string;
  stores?: Types.ObjectId[];
}
