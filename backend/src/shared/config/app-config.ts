export interface AppConfig {
  bodyLimit: string;
  allowedCorsOrigins: string[];
  processingRateLimitMaxRequests: number;
  processingRateLimitWindowMs: number;
}

export function createDefaultAppConfig(): AppConfig {
  return {
    bodyLimit: "1mb",
    allowedCorsOrigins: [],
    processingRateLimitMaxRequests: 20,
    processingRateLimitWindowMs: 60_000,
  };
}

