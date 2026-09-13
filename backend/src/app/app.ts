import express from "express";
import type { EnvironmentConfig } from "../shared/config/env";
import type { Logger } from "../shared/logger/logger";
import type { InMemoryMetricsRegistry } from "../shared/telemetry/metrics";
import { httpErrorHandler } from "./errors/http-error-handler";
import type { ReadinessCheck } from "./health/ready-check";
import { createCorsMiddleware } from "./middlewares/cors.middleware";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { requestLoggingMiddleware } from "./middlewares/request-logging.middleware";
import { securityHeadersMiddleware } from "./middlewares/security-headers.middleware";
import { createApiRoutes, type ApiControllers } from "./routes/api.routes";

export interface CreateAppDependencies {
  config: EnvironmentConfig;
  logger: Logger;
  metrics: InMemoryMetricsRegistry;
  readinessCheck: ReadinessCheck;
}

export function createApp(
  controllers: ApiControllers,
  dependencies: CreateAppDependencies,
) {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(createCorsMiddleware(dependencies.config.allowedCorsOrigins));
  app.use(express.json({ limit: dependencies.config.bodyLimit }));
  app.use(requestLoggingMiddleware(dependencies.logger, dependencies.metrics));
  app.use(
    createApiRoutes(controllers, {
      config: dependencies.config,
      metrics: dependencies.metrics,
      readinessCheck: dependencies.readinessCheck,
      processingRateLimit: {
        maxRequests: dependencies.config.processingRateLimitMaxRequests,
        windowMs: dependencies.config.processingRateLimitWindowMs,
      },
    }),
  );
  app.use(httpErrorHandler);

  return app;
}
