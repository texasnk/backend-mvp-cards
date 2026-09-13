import { normalizeStudyDomainName } from "../../shared/utils/normalization";

export const STUDY_DOMAIN_NAME_MIN_LENGTH = 3;
export const STUDY_DOMAIN_NAME_MAX_LENGTH = 40;

/** SPEC-DOM-01: Representa um domínio de estudo persistido. */
export interface IStudyDomain {
  id: string;
  name: string;
  nameNormalized: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudyDomainInput {
  id: string;
  name: string;
}

export interface UpdateStudyDomainInput {
  id: string;
  name: string;
}

/** SPEC-DOM-02: Define os filtros de listagem de domínios. */
export interface IListStudyDomainsFilters {
  search?: string;
  page: number;
  pageSize: number;
}

/** SPEC-ORM-02: Define as consultas de domínio usadas por outros serviços. */
export interface IDomainLookupService {
  getById(id: string): Promise<IStudyDomain>;
  list(filters: IListStudyDomainsFilters): Promise<import("../../shared/types/pagination.types").PaginatedResult<IStudyDomain>>;
}

/** SPEC-DOM-10: Valida o nome informado para um domínio. */
export function assertStudyDomainName(name: string): void {
  const normalizedInput = name.trim();

  if (
    normalizedInput.length < STUDY_DOMAIN_NAME_MIN_LENGTH ||
    normalizedInput.length > STUDY_DOMAIN_NAME_MAX_LENGTH
  ) {
    throw new Error(
      `Study domain name must have between ${STUDY_DOMAIN_NAME_MIN_LENGTH} and ${STUDY_DOMAIN_NAME_MAX_LENGTH} characters.`,
    );
  }
}

/** SPEC-DOM-11: Normaliza os dados antes da persistência do domínio. */
export function buildStudyDomain(
  input: CreateStudyDomainInput,
): Omit<IStudyDomain, "createdAt" | "updatedAt"> {
  assertStudyDomainName(input.name);

  return {
    id: input.id,
    name: input.name.trim(),
    nameNormalized: normalizeStudyDomainName(input.name),
  };
}
