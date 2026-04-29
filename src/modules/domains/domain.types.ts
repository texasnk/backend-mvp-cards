import { normalizeStudyDomainName } from "../../shared/utils/normalization";

export const STUDY_DOMAIN_NAME_MIN_LENGTH = 3;
export const STUDY_DOMAIN_NAME_MAX_LENGTH = 40;

export interface StudyDomain {
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

export interface ListStudyDomainsFilters {
  search?: string;
  page: number;
  pageSize: number;
}

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

export function buildStudyDomain(input: CreateStudyDomainInput): Omit<StudyDomain, "createdAt" | "updatedAt"> {
  assertStudyDomainName(input.name);

  return {
    id: input.id,
    name: input.name.trim(),
    nameNormalized: normalizeStudyDomainName(input.name),
  };
}

