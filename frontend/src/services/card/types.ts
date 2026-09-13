import type { IPaginatedResponse } from "../domain/types";
export type TCardSource = "manual" | "generated";
export type TCardApproach =
  | "definicao"
  | "comparacao"
  | "causa_efeito"
  | "aplicacao_pratica"
  | "armadilha_conceitual"
  | "verdadeiro_falso";
export interface ICard {
  id: string;
  studyDomainId: string;
  sourceType: TCardSource;
  approach: TCardApproach | null;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
  state: "new" | "learning" | "review" | "relearn";
  dueAt: string;
  learningStep: number;
  intervalDays: number;
  easeFactor: number;
}
export interface ICardInput {
  studyDomainId: string;
  front: string;
  back: string;
  approach?: TCardApproach | null;
}
export interface ICardFilters {
  studyDomainId?: string;
  sourceType?: TCardSource;
  approach?: TCardApproach;
  page: number;
  pageSize: number;
}
export type ICardsPage = IPaginatedResponse<ICard>;
export type TReviewRating = "again" | "hard" | "good" | "easy";
export interface IReviewOption {
  rating: TReviewRating;
  dueAt: string;
  intervalDays: number;
}
export interface IReviewResult {
  cardId: string;
  rating: TReviewRating;
  previousState: ICard["state"];
  schedule: Omit<
    ICard,
    | "id"
    | "studyDomainId"
    | "sourceType"
    | "approach"
    | "front"
    | "back"
    | "createdAt"
    | "updatedAt"
  >;
}
export interface IBulkDeleteResult {
  deletedIds: string[];
  failures: { id: string; code: string; message: string }[];
}
export interface IImportCardsResult {
  items: ICard[];
  total: number;
  failures: { index: number; code: string }[];
}
