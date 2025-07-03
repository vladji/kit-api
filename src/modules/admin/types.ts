import { Request } from "express";

interface LoginBody {
  uniqId: string;
  password: string;
}

export type LoginRequest = Request<{}, {}, LoginBody>
