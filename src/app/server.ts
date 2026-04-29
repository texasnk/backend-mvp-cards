import type { Server } from "node:http";
import { createApp } from "./app";
import type { ApiControllers } from "./routes/api.routes";

export function startServer(controllers: ApiControllers, port: number): Server {
  const app = createApp(controllers);
  return app.listen(port);
}

