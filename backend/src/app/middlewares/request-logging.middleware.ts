import type { NextFunction, Request, Response } from "express";
import type { Logger } from "../../shared/logger/logger";
import type { InMemoryMetricsRegistry } from "../../shared/telemetry/metrics";

export function requestLoggingMiddleware(
  logger: Logger,
  metrics: InMemoryMetricsRegistry,
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const startedAt = Date.now();

    response.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const route = request.route?.path ?? request.path;
      const requestId = request.requestId ?? "unknown";

      metrics.increment("http_requests_total", {
        method: request.method,
        route,
        status_code: String(response.statusCode),
      });
      metrics.observeDuration("http_request_duration_ms", durationMs, {
        method: request.method,
        route,
      });

      logger.info("HTTP request completed", {
        requestId,
        route,
        method: request.method,
        statusCode: response.statusCode,
        durationMs,
      });
    });

    next();
  };
}
