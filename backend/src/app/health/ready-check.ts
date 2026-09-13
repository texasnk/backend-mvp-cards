export interface ReadinessCheck {
  check(): Promise<{
    status: "ready" | "not_ready";
    details?: Record<string, unknown>;
  }>;
}

export class StaticReadinessCheck implements ReadinessCheck {
  constructor(private readonly isReady = true) {}

  async check(): Promise<{
    status: "ready" | "not_ready";
    details?: Record<string, unknown>;
  }> {
    return this.isReady ? { status: "ready" } : { status: "not_ready" };
  }
}
