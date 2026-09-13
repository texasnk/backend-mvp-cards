import type { Card as PrismaCard, PrismaClient } from "@prisma/client";
import type { PaginatedResult } from "../../shared/types/pagination.types";
import { buildCreateCardInput, type Card, type CreateCardInput, type ListCardsFilters, type UpdateCardInput, type UpdateCardScheduleInput } from "../../services/cards/types";
import type { ICardRepository } from "./types";

/** SPEC-ORM-01: Implementa a persistência de cards exclusivamente com Prisma. */
export class CardRepository implements ICardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** SPEC-CARD-01: Cria um card validado. */
  async create(input: CreateCardInput): Promise<Card> {
    return mapCard(await this.prisma.card.create({ data: buildCreateCardInput(input) }));
  }

  /** SPEC-CARD-02: Cria vários cards mantendo o contrato do domínio. */
  async createMany(inputs: CreateCardInput[]): Promise<Card[]> {
    return Promise.all(inputs.map((input) => this.create(input)));
  }

  /** SPEC-CARD-03: Busca um card pelo identificador. */
  async findById(id: string): Promise<Card | null> {
    const card = await this.prisma.card.findUnique({ where: { id } });
    return card ? mapCard(card) : null;
  }

  /** SPEC-CARD-30: Busca card idêntico no mesmo domínio. */
  async findExact(studyDomainId: string, front: string, back: string): Promise<Card | null> {
    const card = await this.prisma.card.findFirst({ where: { studyDomainId, front: front.trim(), back: back.trim() } });
    return card ? mapCard(card) : null;
  }

  /** SPEC-CARD-04: Lista cards com filtros e paginação. */
  async list(filters: ListCardsFilters): Promise<PaginatedResult<Card>> {
    const where = {
      ...(filters.studyDomainId ? { studyDomainId: filters.studyDomainId } : {}),
      ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters.approach ? { approach: filters.approach } : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.card.count({ where }),
      this.prisma.card.findMany({ where, orderBy: { createdAt: "desc" }, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize }),
    ]);
    return { items: items.map(mapCard), page: filters.page, pageSize: filters.pageSize, total };
  }

  /** SPEC-CARD-05: Atualiza os campos editáveis de um card. */
  async update(input: UpdateCardInput): Promise<Card | null> {
    const data = {
      ...(input.front !== undefined ? { front: input.front.trim() } : {}),
      ...(input.back !== undefined ? { back: input.back.trim() } : {}),
      ...(input.approach !== undefined ? { approach: input.approach } : {}),
      updatedAt: new Date(),
    };
    const result = await this.prisma.card.updateMany({ where: { id: input.id }, data });
    return result.count ? this.findById(input.id) : null;
  }

  /** SPEC-CARD-06: Exclui um card pelo identificador. */
  async deleteById(id: string): Promise<boolean> {
    return (await this.prisma.card.deleteMany({ where: { id } })).count > 0;
  }

  /** SPEC-CARD-31: Exclui todos os cards de um domínio. */
  async deleteByStudyDomainId(studyDomainId: string): Promise<number> {
    return (await this.prisma.card.deleteMany({ where: { studyDomainId } })).count;
  }

  /** SPEC-REV-18: Atualiza somente a agenda calculada pela service de revisão. */
  async updateSchedule(input: UpdateCardScheduleInput): Promise<boolean> {
    return (await this.prisma.card.updateMany({ where: { id: input.id }, data: { state: input.state, dueAt: input.dueAt, learningStep: input.learningStep, intervalDays: input.intervalDays, easeFactor: input.easeFactor, updatedAt: new Date() } })).count > 0;
  }
}

/** SPEC-CARD-07: Converte o modelo Prisma no contrato de card. */
function mapCard(card: PrismaCard): Card {
  return { id: card.id, studyDomainId: card.studyDomainId, sourceType: card.sourceType as Card["sourceType"], approach: card.approach as Card["approach"], front: card.front, back: card.back, createdAt: card.createdAt, updatedAt: card.updatedAt, state: card.state as Card["state"], dueAt: card.dueAt, learningStep: card.learningStep, intervalDays: card.intervalDays, easeFactor: Number(card.easeFactor) };
}
