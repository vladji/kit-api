import { Socket } from "socket.io";

import { AdminProps } from "../modules/admin/types";

export interface CustomSocket extends Socket {
  userId?: string;
  admin?: AdminProps;
}

export enum SocketError {
  TokenExpired = "token_expired",
  InvalidToken = "invalid_token",
  AdminNotFound = "admin_not_found",
  AccessDenied = "access_denied",
  InternalError = "internal_error",
}
