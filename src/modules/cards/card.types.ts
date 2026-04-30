export const CARD_TEXT_MIN_LENGTH = 3;

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

export function assertCardTextField(field: "front" | "back", value: string): void {
  if (value.trim().length < CARD_TEXT_MIN_LENGTH) {
    throw new Error(`Card ${field} must have at least ${CARD_TEXT_MIN_LENGTH} characters.`);
  }
}
