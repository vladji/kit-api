import { UserRoles } from "../../modules/user/types";
import { Types } from "mongoose";

export type TokenUserRoles = Partial<Record<UserRoles, boolean>>;

export interface TokenPayload {
  id: Types.ObjectId;
  uniqId: string;
  roles: TokenUserRoles;
  createdAt: number,
}
