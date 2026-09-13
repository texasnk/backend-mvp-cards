export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export class JsonLogger implements Logger {
  constructor(private readonly service = "backend-mvp-cards") {}

  info(message: string, context: LogContext = {}): void {
    this.write("info", message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.write("warn", message, context);
  }

  error(message: string, context: LogContext = {}): void {
    this.write("error", message, context);
  }

  private write(
    level: "info" | "warn" | "error",
    message: string,
    context: LogContext,
  ): void {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...sanitizeLogContext(context),
    });

    if (level === "error") {
      console.error(payload);
      return;
    }

    console.log(payload);
  }
}

export function sanitizeLogContext(context: LogContext): LogContext {
  const sanitizedEntries = Object.entries(context).map(([key, value]) => {
    if (isSensitiveField(key)) {
      return [key, "[REDACTED]"];
    }

    if (typeof value === "string" && value.length > 500) {
      return [key, `${value.slice(0, 500)}...[TRUNCATED]`];
    }

    return [key, value];
  });

  return Object.fromEntries(sanitizedEntries);
}

function isSensitiveField(key: string): boolean {
  const normalized = key.toLowerCase();

  return (
    normalized.includes("apikey") ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("password") ||
    normalized.includes("prompt") ||
    normalized.includes("file") ||
    normalized.includes("text")
  );
}
