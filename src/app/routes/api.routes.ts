import { Router } from "express";
import { CardController } from "../../modules/cards/card.controller";
import { DomainController } from "../../modules/domains/domain.controller";
import { ProcessingController } from "../../modules/processing/processing.controller";
import type { EnvironmentConfig } from "../../shared/config/env";
import { createRateLimitMiddleware, type RateLimitOptions } from "../middlewares/rate-limit.middleware";
import { createUploadMiddleware } from "../middlewares/upload.middleware";
import type { InMemoryMetricsRegistry } from "../../shared/telemetry/metrics";
import type { ReadinessCheck } from "../health/ready-check";

export interface ApiControllers {
  domainController: DomainController;
  cardController: CardController;
  processingController: ProcessingController;
}

export interface ApiRouteDependencies {
  config: EnvironmentConfig;
  metrics: InMemoryMetricsRegistry;
  readinessCheck: ReadinessCheck;
  processingRateLimit: RateLimitOptions;
}

export function createApiRoutes(
  controllers: ApiControllers,
  dependencies: ApiRouteDependencies,
): Router {
  const router = Router();
  const processingRateLimit = createRateLimitMiddleware(dependencies.processingRateLimit);
  const upload = createUploadMiddleware({
    maxFileSizeBytes: dependencies.config.maxFileSizeMb * 1024 * 1024,
  });

  router.post("/api/v1/domains", wrap(controllers.domainController.create));
  router.get("/api/v1/domains", wrap(controllers.domainController.list));
  router.get("/api/v1/domains/:id", wrap(controllers.domainController.getById));
  router.patch("/api/v1/domains/:id", wrap(controllers.domainController.update));
  router.delete("/api/v1/domains/:id", wrap(controllers.domainController.delete));

  router.post("/api/v1/cards", wrap(controllers.cardController.create));
  router.get("/api/v1/cards", wrap(controllers.cardController.list));
  router.get("/api/v1/cards/:id", wrap(controllers.cardController.getById));
  router.patch("/api/v1/cards/:id", wrap(controllers.cardController.update));
  router.delete("/api/v1/cards/:id", wrap(controllers.cardController.delete));

  router.post(
    "/api/v1/processings",
    upload.single("file"),
    processingRateLimit,
    wrap(controllers.processingController.create),
  );

  router.get("/api/v1/health/live", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  router.get("/api/v1/health/ready", wrap(async (_request, response) => {
    const readiness = await dependencies.readinessCheck.check();
    response.status(readiness.status === "ready" ? 200 : 503).json(readiness);
  }));

  router.get("/api/v1/metrics", (_request, response) => {
    response.status(200).type("text/plain").send(dependencies.metrics.renderPrometheus());
  });

  return router;
}

function wrap(
  handler: (request: any, response: any, next?: any) => Promise<void>,
) {
  return (request: any, response: any, next: any) => {
    void handler(request, response, next).catch(next);
  };
}
