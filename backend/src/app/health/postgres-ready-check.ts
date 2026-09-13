import type { PostgresConnectionManager } from "../../shared/db/postgres.client";
import type { ReadinessCheck } from "./ready-check";

export class PostgresReadinessCheck implements ReadinessCheck {
  constructor(private readonly connectionManager: PostgresConnectionManager) {}

  async check(): Promise<{
    status: "ready" | "not_ready";
    details?: Record<string, unknown>;
  }> {
    try {
      await this.connectionManager.ping();
      return { status: "ready" };
    } catch (error) {
      return {
        status: "not_ready",
        details: {
          reason:
            error instanceof Error ? error.message : "Unknown readiness error",
        },
      };
    }
  }
}
