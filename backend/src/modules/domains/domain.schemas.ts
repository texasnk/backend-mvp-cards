import { ValidationError } from "../../shared/errors/app-error";

export interface DomainParams {
  id: string;
}

export interface CreateDomainBody {
  name: string;
}

export interface UpdateDomainBody {
  name: string;
}

export interface ListDomainsQuery {
  search?: string;
  page: number;
  pageSize: number;
}

export function parseDomainParams(params: unknown): DomainParams {
  const value = asObject(params);
  const id = asNonEmptyString(value.id, "id");

  return { id };
}

export function parseCreateDomainBody(body: unknown): CreateDomainBody {
  const value = asObject(body);

  return {
    name: asNonEmptyString(value.name, "name"),
  };
}

export function parseUpdateDomainBody(body: unknown): UpdateDomainBody {
  const value = asObject(body);

  return {
    name: asNonEmptyString(value.name, "name"),
  };
}

export function parseListDomainsQuery(query: unknown): ListDomainsQuery {
  const value = asObject(query);

  return {
    search: asOptionalString(value.search),
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
    throw new ValidationError('Field "search" must be a string.', "INVALID_QUERY");
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

