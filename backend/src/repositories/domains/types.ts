import type { PaginatedResult } from "../../shared/types/pagination.types";
import type { CreateStudyDomainInput, IListStudyDomainsFilters, IStudyDomain, UpdateStudyDomainInput } from "../../services/domains/types";

/** SPEC-ORM-02: Define as operações de persistência de domínios. */
export interface IDomainRepository {
  create(input: CreateStudyDomainInput): Promise<IStudyDomain>;
  findById(id: string): Promise<IStudyDomain | null>;
  findByNormalizedName(nameNormalized: string): Promise<IStudyDomain | null>;
  list(filters: IListStudyDomainsFilters): Promise<PaginatedResult<IStudyDomain>>;
  updateName(input: UpdateStudyDomainInput): Promise<IStudyDomain | null>;
  deleteById(id: string): Promise<boolean>;
}
