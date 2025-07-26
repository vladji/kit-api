import { Socket } from "socket.io";

import { AdminProps } from "../modules/admin/types";
import { Types } from "mongoose";

export interface CustomSocket extends Socket {
  userId?: Types.ObjectId;
  admin?: AdminProps;
}

export enum SocketError {
  TokenExpired = "token_expired",
  InvalidToken = "invalid_token",
  AdminNotFound = "admin_not_found",
  AccessDenied = "access_denied",
  InternalError = "internal_error",
}
