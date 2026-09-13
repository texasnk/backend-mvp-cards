import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface CounterEntry {
  count: number;
  expiresAt: number;
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const counters = new Map<string, CounterEntry>();

  return (request: Request, _response: Response, next: NextFunction): void => {
    const key = request.ip || "unknown";
    const now = Date.now();
    const entry = counters.get(key);

    if (!entry || entry.expiresAt <= now) {
      counters.set(key, {
        count: 1,
        expiresAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (entry.count >= options.maxRequests) {
      next(
        new ValidationError(
          "Rate limit exceeded for processing endpoint.",
          "RATE_LIMIT_EXCEEDED",
        ),
      );
      return;
    }

    entry.count += 1;
    next();
  };
}
