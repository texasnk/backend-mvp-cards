import { ValidationError } from "../../shared/errors/app-error";
import type { ProcessingInputType } from "./processing.types";

export interface CreateProcessingBody {
  requestId?: string;
  inputType?: ProcessingInputType;
  text?: string;
  domainId?: string;
  cardsCount?: number;
}

export function parseCreateProcessingBody(body: unknown): CreateProcessingBody {
  const value = asObject(body);
  const requestId = asOptionalString(value.requestId);
  const inputType = asOptionalInputType(value.inputType);
  const text = asOptionalString(value.text);
  const domainId = asOptionalString(value.domainId);
  const cardsCount = asOptionalInteger(value.cardsCount, "cardsCount");

  return {
    requestId,
    inputType,
    text,
    domainId,
    cardsCount,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new ValidationError("Invalid request object.", "INVALID_REQUEST_OBJECT");
  }

  return value as Record<string, unknown>;
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("Invalid string field.", "INVALID_FIELD");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asOptionalInputType(value: unknown): ProcessingInputType | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value !== "text" && value !== "image" && value !== "pdf") {
    throw new ValidationError('Field "inputType" is invalid.', "INVALID_FIELD");
  }

  return value;
}

function asOptionalInteger(value: unknown, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new ValidationError(`Field "${field}" must be an integer.`, "INVALID_FIELD");
  }

  return parsed;
}

