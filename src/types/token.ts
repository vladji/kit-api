import { UserRole } from "./admin";

export interface TokenPayload {
  uniqId: string;
  roles: Partial<Record<UserRole, boolean>>;
}
