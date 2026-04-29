import express from "express";
import { httpErrorHandler } from "./errors/http-error-handler";
import { createApiRoutes, type ApiControllers } from "./routes/api.routes";

export function createApp(controllers: ApiControllers) {
  const app = express();

  app.use(express.json());
  app.use(createApiRoutes(controllers));
  app.use(httpErrorHandler);

  return app;
}

