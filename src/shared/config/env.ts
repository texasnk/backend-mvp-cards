import { config as loadEnv } from "dotenv";
import { ValidationError } from "../errors/app-error";
import type { AppConfig } from "./app-config";

loadEnv();

export interface EnvironmentConfig extends AppConfig {
  port: number;
  databaseUrl: string;
  openAiApiKey: string;
  openAiModelText: string;
  openAiModelVision: string;
  requestTimeoutMs: number;
  maxFileSizeMb: number;
  maxTextChars: number;
  maxCardsPerRequest: number;
  defaultCardsPerRequest: number;
  domainMatchThreshold: number;
  maxPdfPages: number;
  maxImageWidth: number;
  maxImageHeight: number;
  logLevel: string;
}

export function loadEnvironmentConfig(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  return {
    port: asInteger(env.PORT, 3000, "PORT"),
    databaseUrl: asRequiredString(env.DATABASE_URL, "DATABASE_URL"),
    openAiApiKey: asRequiredString(env.OPENAI_API_KEY, "OPENAI_API_KEY"),
    openAiModelText: asRequiredString(env.OPENAI_MODEL_TEXT, "OPENAI_MODEL_TEXT"),
    openAiModelVision: asRequiredString(env.OPENAI_MODEL_VISION, "OPENAI_MODEL_VISION"),
    maxFileSizeMb: asInteger(env.MAX_FILE_SIZE_MB, 10, "MAX_FILE_SIZE_MB"),
    maxTextChars: asInteger(env.MAX_TEXT_CHARS, 10000, "MAX_TEXT_CHARS"),
    maxCardsPerRequest: asInteger(env.MAX_CARDS_PER_REQUEST, 10, "MAX_CARDS_PER_REQUEST"),
    defaultCardsPerRequest: asInteger(
      env.DEFAULT_CARDS_PER_REQUEST,
      3,
      "DEFAULT_CARDS_PER_REQUEST",
    ),
    requestTimeoutMs: asInteger(env.REQUEST_TIMEOUT_MS, 30000, "REQUEST_TIMEOUT_MS"),
    allowedCorsOrigins: asList(env.ALLOWED_CORS_ORIGINS),
    logLevel: asString(env.LOG_LEVEL, "info"),
    domainMatchThreshold: asFloat(env.DOMAIN_MATCH_THRESHOLD, 0.8, "DOMAIN_MATCH_THRESHOLD"),
    processingRateLimitMaxRequests: asInteger(
      env.PROCESSING_RATE_LIMIT_MAX_REQUESTS,
      20,
      "PROCESSING_RATE_LIMIT_MAX_REQUESTS",
    ),
    processingRateLimitWindowMs: asInteger(
      env.PROCESSING_RATE_LIMIT_WINDOW_MS,
      60000,
      "PROCESSING_RATE_LIMIT_WINDOW_MS",
    ),
    maxPdfPages: asInteger(env.MAX_PDF_PAGES, 40, "MAX_PDF_PAGES"),
    maxImageWidth: asInteger(env.MAX_IMAGE_WIDTH, 1280, "MAX_IMAGE_WIDTH"),
    maxImageHeight: asInteger(env.MAX_IMAGE_HEIGHT, 720, "MAX_IMAGE_HEIGHT"),
    bodyLimit: asString(env.BODY_LIMIT, "1mb"),
  };
}

function asRequiredString(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`Environment variable "${key}" is required.`, "INVALID_ENV");
  }

  return value.trim();
}

function asString(value: string | undefined, defaultValue: string): string {
  return value?.trim() || defaultValue;
}

function asInteger(value: string | undefined, defaultValue: number, key: string): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`Environment variable "${key}" must be a positive integer.`, "INVALID_ENV");
  }

  return parsed;
}

function asFloat(value: string | undefined, defaultValue: number, key: string): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new ValidationError(`Environment variable "${key}" must be a number between 0 and 1.`, "INVALID_ENV");
  }

  return parsed;
}

function asList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
