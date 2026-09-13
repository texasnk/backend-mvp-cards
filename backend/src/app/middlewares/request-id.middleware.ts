import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export const REQUEST_ID_HEADER = "X-Request-Id";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = request.header(REQUEST_ID_HEADER) ?? randomUUID();
  request.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}

