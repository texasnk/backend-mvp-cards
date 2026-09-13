import type { ICardRepository } from "../../repositories/cards/types";
import type { IDomainRepository } from "../../repositories/domains/types";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { handleServiceError } from "../../shared/errors/error-handler";
import { normalizeStudyDomainName } from "../../shared/utils/normalization";
import type { CreateStudyDomainInput, IListStudyDomainsFilters, IStudyDomain, UpdateStudyDomainInput } from "./types";

/** SPEC-ORM-03: Centraliza as regras de negócio de domínios. */
export class DomainService {
  constructor(private readonly domainRepository: IDomainRepository, private readonly cardRepository?: ICardRepository) {}

  /** SPEC-DOM-12: Cria um domínio quando o nome ainda não estiver em uso. */
  async create(input: CreateStudyDomainInput): Promise<IStudyDomain> {
    return handleServiceError(async () => {
      await this.ensureNameIsUnique(input.name);
      return this.domainRepository.create(input);
    }, "Não foi possível criar o domínio de estudo.");
  }

  /** SPEC-DOM-13: Obtém um domínio existente pelo identificador. */
  async getById(id: string): Promise<IStudyDomain> {
    return handleServiceError(async () => {
      const domain = await this.domainRepository.findById(id);
      if (!domain) throw new NotFoundError(`Domínio de estudo ${id} não encontrado.`, "STUDY_DOMAIN_NOT_FOUND");
      return domain;
    }, "Não foi possível consultar o domínio de estudo.");
  }

  /** SPEC-DOM-14: Lista domínios de estudo paginados. */
  async list(filters: IListStudyDomainsFilters) {
    return handleServiceError(() => this.domainRepository.list(filters), "Não foi possível listar os domínios de estudo.");
  }

  /** SPEC-DOM-15: Atualiza um domínio preservando a unicidade do nome. */
  async update(input: UpdateStudyDomainInput): Promise<IStudyDomain> {
    return handleServiceError(async () => {
      const currentDomain = await this.getById(input.id);
      if (currentDomain.nameNormalized !== normalizeStudyDomainName(input.name)) await this.ensureNameIsUnique(input.name, input.id);
      const updatedDomain = await this.domainRepository.updateName(input);
      if (!updatedDomain) throw new NotFoundError(`Domínio de estudo ${input.id} não encontrado.`, "STUDY_DOMAIN_NOT_FOUND");
      return updatedDomain;
    }, "Não foi possível atualizar o domínio de estudo.");
  }

  /** SPEC-DOM-16: Exclui um domínio e seus cards associados. */
  async delete(id: string): Promise<void> {
    return handleServiceError(async () => {
      await this.getById(id);
      await this.cardRepository?.deleteByStudyDomainId(id);
      await this.domainRepository.deleteById(id);
    }, "Não foi possível excluir o domínio de estudo.");
  }

  /** SPEC-DOM-30: Exclui domínios e seus cards, preservando falhas do lote. */
  async deleteMany(ids: string[]): Promise<{ deletedIds: string[]; failures: { id: string; code: string; message: string }[] }> {
    const deletedIds: string[] = [];
    const failures: { id: string; code: string; message: string }[] = [];
    for (const id of ids) {
      try { await this.delete(id); deletedIds.push(id); }
      catch (error) { failures.push({ id, code: error instanceof NotFoundError ? error.code : "DELETE_FAILED", message: error instanceof Error ? error.message : "Não foi possível excluir o domínio." }); }
    }
    return { deletedIds, failures };
  }

  /** SPEC-DOM-17: Garante que o nome normalizado seja único. */
  private async ensureNameIsUnique(name: string, currentId?: string): Promise<void> {
    const existingDomain = await this.domainRepository.findByNormalizedName(normalizeStudyDomainName(name));
    if (existingDomain && existingDomain.id !== currentId) throw new ConflictError(`O domínio de estudo "${name.trim()}" já existe.`, "STUDY_DOMAIN_ALREADY_EXISTS");
  }
}
