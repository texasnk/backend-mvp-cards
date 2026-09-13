import { ValidationError } from "../../shared/errors/app-error";
import type { ProcessingInputType } from "../../services/processing/types";

export interface CreateProcessingBody {
  requestId?: string;
  inputType?: ProcessingInputType;
  text?: string;
  domainId?: string;
  cardsCount?: number;
}

export function parseCreateProcessingBody(body: unknown): CreateProcessingBody {
  const value = asObject(body);
  const requestId = asOptionalUuid(value.requestId, "requestId");
  const inputType = asOptionalInputType(value.inputType);
  const text = asOptionalString(value.text);
  const domainId = asOptionalUuid(value.domainId, "domainId");
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
    throw new ValidationError(
      "Invalid request object.",
      "INVALID_REQUEST_OBJECT",
    );
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

function asOptionalUuid(value: unknown, field: string): string | undefined {
  const parsed = asOptionalString(value);

  if (parsed === undefined) {
    return undefined;
  }

  if (!UUID_PATTERN.test(parsed)) {
    throw new ValidationError(
      `Field "${field}" must be a valid UUID.`,
      "INVALID_FIELD",
    );
  }

  return parsed;
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
    throw new ValidationError(
      `Field "${field}" must be an integer.`,
      "INVALID_FIELD",
    );
  }

  return parsed;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
