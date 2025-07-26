import { Types } from "mongoose";

export enum UserRoles {
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
  avatar?: string;
  stores?: Types.ObjectId[];
}

export interface UserPropsClient {
  id: string;
  uniqueId: string;
  deviceData: DeviceDataProps;
  createdAt: Date;
  updatedAt: Date;
  publicName?: string;
  avatar?: string;
  storeId?: string;
}
