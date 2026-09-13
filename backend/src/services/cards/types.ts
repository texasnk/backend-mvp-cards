import { ValidationError } from "../../shared/errors/app-error";

export const CARD_FRONT_MIN_LENGTH = 3;
export const CARD_BACK_MIN_LENGTH = 1;

export const CARD_SOURCE_TYPES = ["manual", "generated"] as const;
export type CardSourceType = (typeof CARD_SOURCE_TYPES)[number];

export const CARD_APPROACHES = [
  "definicao",
  "comparacao",
  "causa_efeito",
  "aplicacao_pratica",
  "armadilha_conceitual",
  "verdadeiro_falso",
] as const;
export type CardApproach = (typeof CARD_APPROACHES)[number];

export interface Card {
  id: string;
  studyDomainId: string;
  sourceType: CardSourceType;
  approach: CardApproach | null;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  state: "new" | "learning" | "review" | "relearn";
  dueAt: Date;
  learningStep: number;
  intervalDays: number;
  easeFactor: number;
}

export interface UpdateCardScheduleInput {
  id: string;
  state: Card["state"];
  dueAt: Date;
  learningStep: number;
  intervalDays: number;
  easeFactor: number;
}

export interface CreateCardInput {
  id: string;
  studyDomainId: string;
  sourceType: CardSourceType;
  front: string;
  back: string;
  approach?: CardApproach | null;
}

export interface UpdateCardInput {
  id: string;
  front?: string;
  back?: string;
  approach?: CardApproach | null;
}

export interface ListCardsFilters {
  studyDomainId?: string;
  sourceType?: CardSourceType;
  approach?: CardApproach;
  page: number;
  pageSize: number;
}

/** SPEC-ORM-02: Define a persistência de cards gerados usada por outros serviços. */
export interface IGeneratedCardsService {
  persistGeneratedCards(cards: Array<{ id: string; studyDomainId: string; front: string; back: string; approach: CardApproach }>): Promise<Card[]>;
}

export function assertCardContent(front: string, back: string): void {
  assertCardTextField("front", front);
  assertCardTextField("back", back);
}

export function buildCreateCardInput(input: CreateCardInput): CreateCardInput {
  assertCardContent(input.front, input.back);

  return {
    ...input,
    front: input.front.trim(),
    back: input.back.trim(),
    approach: input.approach ?? null,
  };
}

export function assertCardTextField(
  field: "front" | "back",
  value: string,
): void {
  const minLength =
    field === "front" ? CARD_FRONT_MIN_LENGTH : CARD_BACK_MIN_LENGTH;

  if (value.trim().length < minLength) {
    throw new ValidationError(
      `Card ${field} must have at least ${minLength} character${minLength === 1 ? "" : "s"}.`,
      "INVALID_CARD_FIELD",
    );
  }
}
