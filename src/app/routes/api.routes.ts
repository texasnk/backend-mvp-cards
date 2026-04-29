import { Router } from "express";
import { CardController } from "../../modules/cards/card.controller";
import { DomainController } from "../../modules/domains/domain.controller";
import { ProcessingController } from "../../modules/processing/processing.controller";

export interface ApiControllers {
  domainController: DomainController;
  cardController: CardController;
  processingController: ProcessingController;
}

export function createApiRoutes(controllers: ApiControllers): Router {
  const router = Router();

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

  router.post("/api/v1/processings", wrap(controllers.processingController.create));

  router.get("/api/v1/health/live", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  router.get("/api/v1/health/ready", (_request, response) => {
    response.status(200).json({ status: "ready" });
  });

  router.get("/api/v1/metrics", (_request, response) => {
    response.status(200).type("text/plain").send("# metrics not configured yet\n");
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

