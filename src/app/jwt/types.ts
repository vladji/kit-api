import { UserRoles } from "../../modules/user/types";

export type TokenUserRoles = Partial<Record<UserRoles, boolean>>;

export interface TokenPayload {
  uniqId: string;
  roles: TokenUserRoles;
}
