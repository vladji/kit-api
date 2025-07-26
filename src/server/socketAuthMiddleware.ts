import jwt, { TokenExpiredError } from "jsonwebtoken";
import { CustomSocket, SocketError } from "./types";
import { AdminDocument, AdminModel } from "../modules/admin/admin.model";
import { TokenPayload } from "../app/jwt/types";
import { UserRoles } from "../modules/user/types";

const TOKEN_SECRET = process.env.TOKEN_SECRET!;

export const socketAuthMiddleware = async (
  socket: CustomSocket,
  next: Function
) => {
  try {
    const tokenRaw = socket.handshake.auth?.token;

    if (!tokenRaw) {
      return next();
    }

    const token = tokenRaw.replace("Bearer ", "");
    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(token, TOKEN_SECRET) as TokenPayload;
    } catch (err: any) {
      if (err instanceof TokenExpiredError) {
        return next(new Error(SocketError.TokenExpired));
      }
      return next(new Error(SocketError.InvalidToken));
    }

    if (decoded.roles[UserRoles.Admin] || decoded.roles[UserRoles.RootAdmin]) {
      const admin = await AdminModel.findById<AdminDocument>(decoded.id);

      if (!admin) {
        return next(new Error(SocketError.AdminNotFound));
      }

      if (admin.disabled) {
        return next(new Error(SocketError.AccessDenied));
      }

      socket.admin = admin;
      socket.userId = admin.id;
    }
    
    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err);
    return next(new Error(SocketError.InternalError));
  }
};
