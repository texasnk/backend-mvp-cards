import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { normalizeStudyDomainName } from "../../shared/utils/normalization";
import { DomainRepository } from "./domain.repository";
import type {
  CreateStudyDomainInput,
  ListStudyDomainsFilters,
  StudyDomain,
  UpdateStudyDomainInput,
} from "./domain.types";

export class DomainService {
  constructor(private readonly domainRepository: DomainRepository) {}

  async create(input: CreateStudyDomainInput): Promise<StudyDomain> {
    await this.ensureNameIsUnique(input.name);
    return this.domainRepository.create(input);
  }

  async getById(id: string): Promise<StudyDomain> {
    const domain = await this.domainRepository.findById(id);

    if (!domain) {
      throw new NotFoundError(`Study domain ${id} was not found.`, "STUDY_DOMAIN_NOT_FOUND");
    }

    return domain;
  }

  async list(filters: ListStudyDomainsFilters) {
    return this.domainRepository.list(filters);
  }

  async update(input: UpdateStudyDomainInput): Promise<StudyDomain> {
    const currentDomain = await this.getById(input.id);
    const nextNormalizedName = normalizeStudyDomainName(input.name);

    if (currentDomain.nameNormalized !== nextNormalizedName) {
      await this.ensureNameIsUnique(input.name, input.id);
    }

    const updatedDomain = await this.domainRepository.updateName(input);

    if (!updatedDomain) {
      throw new NotFoundError(`Study domain ${input.id} was not found.`, "STUDY_DOMAIN_NOT_FOUND");
    }

    return updatedDomain;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.domainRepository.deleteById(id);
  }

  private async ensureNameIsUnique(name: string, currentId?: string): Promise<void> {
    const existingDomain = await this.domainRepository.findByNormalizedName(
      normalizeStudyDomainName(name),
    );

    if (existingDomain && existingDomain.id !== currentId) {
      throw new ConflictError(
        `Study domain "${name.trim()}" already exists.`,
        "STUDY_DOMAIN_ALREADY_EXISTS",
      );
    }
  }
}

