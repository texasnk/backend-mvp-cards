import type { PaginatedResult } from "../../shared/types/pagination.types";
import type { Card, CreateCardInput, ListCardsFilters, UpdateCardInput, UpdateCardScheduleInput } from "../../services/cards/types";

/** SPEC-ORM-02: Define as operações de persistência de cards. */
export interface ICardRepository {
  create(input: CreateCardInput): Promise<Card>;
  createMany(inputs: CreateCardInput[]): Promise<Card[]>;
  findById(id: string): Promise<Card | null>;
  findExact(studyDomainId: string, front: string, back: string): Promise<Card | null>;
  list(filters: ListCardsFilters): Promise<PaginatedResult<Card>>;
  update(input: UpdateCardInput): Promise<Card | null>;
  deleteById(id: string): Promise<boolean>;
  deleteByStudyDomainId(studyDomainId: string): Promise<number>;
  updateSchedule(input: UpdateCardScheduleInput): Promise<boolean>;
}
