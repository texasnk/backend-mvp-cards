import type { PrismaClient, StudyDomain as PrismaStudyDomain } from "@prisma/client";
import type { PaginatedResult } from "../../shared/types/pagination.types";
import {
  buildStudyDomain,
  type CreateStudyDomainInput,
  type IListStudyDomainsFilters,
  type IStudyDomain,
  type UpdateStudyDomainInput,
} from "../../services/domains/types";
import type { IDomainRepository } from "./types";

/** SPEC-ORM-01: Implementa a persistência de domínios exclusivamente com Prisma. */
export class DomainRepository implements IDomainRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** SPEC-DOM-03: Cria um domínio já normalizado. */
  async create(input: CreateStudyDomainInput): Promise<IStudyDomain> {
    return mapDomain(
      await this.prisma.studyDomain.create({ data: buildStudyDomain(input) }),
    );
  }

  /** SPEC-DOM-04: Busca um domínio pelo identificador. */
  async findById(id: string): Promise<IStudyDomain | null> {
    const domain = await this.prisma.studyDomain.findUnique({ where: { id } });
    return domain ? mapDomain(domain) : null;
  }

  /** SPEC-DOM-05: Busca um domínio pelo nome normalizado. */
  async findByNormalizedName(nameNormalized: string): Promise<IStudyDomain | null> {
    const domain = await this.prisma.studyDomain.findUnique({ where: { nameNormalized } });
    return domain ? mapDomain(domain) : null;
  }

  /** SPEC-DOM-06: Lista domínios respeitando filtro e paginação. */
  async list(filters: IListStudyDomainsFilters): Promise<PaginatedResult<IStudyDomain>> {
    const where = filters.search
      ? { name: { contains: filters.search, mode: "insensitive" as const } }
      : undefined;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.studyDomain.count({ where }),
      this.prisma.studyDomain.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);
    return { items: items.map(mapDomain), page: filters.page, pageSize: filters.pageSize, total };
  }

  /** SPEC-DOM-07: Atualiza o nome e a normalização de um domínio. */
  async updateName(input: UpdateStudyDomainInput): Promise<IStudyDomain | null> {
    const domain = buildStudyDomain(input);
    const result = await this.prisma.studyDomain.updateMany({
      where: { id: input.id },
      data: { name: domain.name, nameNormalized: domain.nameNormalized, updatedAt: new Date() },
    });
    return result.count ? this.findById(input.id) : null;
  }

  /** SPEC-DOM-08: Exclui um domínio pelo identificador. */
  async deleteById(id: string): Promise<boolean> {
    return (await this.prisma.studyDomain.deleteMany({ where: { id } })).count > 0;
  }
}

/** SPEC-DOM-09: Converte o modelo de persistência no contrato do domínio. */
function mapDomain(domain: PrismaStudyDomain): IStudyDomain {
  return { id: domain.id, name: domain.name, nameNormalized: domain.nameNormalized, createdAt: domain.createdAt, updatedAt: domain.updatedAt };
}
