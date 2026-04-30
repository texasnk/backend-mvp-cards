import { ValidationError } from "../../shared/errors/app-error";
import { CARD_APPROACHES, CARD_SOURCE_TYPES, type CardApproach, type CardSourceType } from "./card.types";

export interface CardParams {
  id: string;
}

export interface CreateCardBody {
  studyDomainId: string;
  front: string;
  back: string;
  approach?: CardApproach | null;
}

export interface UpdateCardBody {
  front?: string;
  back?: string;
  approach?: CardApproach | null;
}

export interface ListCardsQuery {
  studyDomainId?: string;
  sourceType?: CardSourceType;
  approach?: CardApproach;
  page: number;
  pageSize: number;
}

export function parseCardParams(params: unknown): CardParams {
  const value = asObject(params);
  return { id: asNonEmptyString(value.id, "id") };
}

export function parseCreateCardBody(body: unknown): CreateCardBody {
  const value = asObject(body);

  return {
    studyDomainId: asNonEmptyString(value.studyDomainId, "studyDomainId"),
    front: asNonEmptyString(value.front, "front"),
    back: asNonEmptyString(value.back, "back"),
    approach: asOptionalApproach(value.approach),
  };
}

export function parseUpdateCardBody(body: unknown): UpdateCardBody {
  const value = asObject(body);
  const parsed: UpdateCardBody = {};

  if (value.front !== undefined) {
    parsed.front = asNonEmptyString(value.front, "front");
  }

  if (value.back !== undefined) {
    parsed.back = asNonEmptyString(value.back, "back");
  }

  if (value.approach !== undefined) {
    parsed.approach = asNullableApproach(value.approach);
  }

  return parsed;
}

export function parseListCardsQuery(query: unknown): ListCardsQuery {
  const value = asObject(query);

  return {
    studyDomainId: asOptionalString(value.studyDomainId),
    sourceType: asOptionalSourceType(value.sourceType),
    approach: asOptionalApproach(value.approach),
    page: asPositiveInteger(value.page, 1, "page"),
    pageSize: asPositiveInteger(value.pageSize, 20, "pageSize"),
  };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new ValidationError("Invalid request object.", "INVALID_REQUEST_OBJECT");
  }

  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Field "${field}" must be a non-empty string.`, "INVALID_FIELD");
  }

  return value.trim();
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("Invalid query field type.", "INVALID_QUERY");
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function asPositiveInteger(value: unknown, defaultValue: number, field: string): number {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ValidationError(`Field "${field}" must be a positive integer.`, "INVALID_QUERY");
  }

  return parsed;
}

function asOptionalSourceType(value: unknown): CardSourceType | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !CARD_SOURCE_TYPES.includes(value as CardSourceType)) {
    throw new ValidationError('Field "sourceType" is invalid.', "INVALID_QUERY");
  }

  return value as CardSourceType;
}

function asOptionalApproach(value: unknown): CardApproach | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !CARD_APPROACHES.includes(value as CardApproach)) {
    throw new ValidationError('Field "approach" is invalid.', "INVALID_FIELD");
  }

  return value as CardApproach;
}

function asNullableApproach(value: unknown): CardApproach | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !CARD_APPROACHES.includes(value as CardApproach)) {
    throw new ValidationError('Field "approach" is invalid.', "INVALID_FIELD");
  }

  return value as CardApproach;
}

