import type { NextFunction, Request, Response } from "express";

export function createCorsMiddleware(allowedOrigins: string[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const origin = request.header("origin");

    if (origin && allowedOrigins.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
    }

    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-Request-Id",
    );
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,DELETE,OPTIONS",
    );

    if (request.method === "OPTIONS") {
      response.status(204).send();
      return;
    }

    next();
  };
}
