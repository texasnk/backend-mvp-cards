import { bootstrapApplication } from "./app/bootstrap";
import { startServer } from "./app/server";

const bootstrap = bootstrapApplication();
const server = startServer(
  bootstrap.controllers,
  bootstrap.appDependencies,
  bootstrap.appDependencies.config.port,
);

process.on("SIGINT", async () => {
  server.close();
  await bootstrap.infrastructure.connectionManager.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  server.close();
  await bootstrap.infrastructure.connectionManager.close();
  process.exit(0);
});

