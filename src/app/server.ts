import type { Server } from "node:http";
import { createApp, type CreateAppDependencies } from "./app";
import type { ApiControllers } from "./routes/api.routes";

export function startServer(
  controllers: ApiControllers,
  dependencies: CreateAppDependencies,
  port: number,
): Server {
  const app = createApp(controllers, dependencies);
  return app.listen(port);
}
