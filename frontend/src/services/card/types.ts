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
