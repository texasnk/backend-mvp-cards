import { http } from "../http";
import type {
  IBulkDeleteResult,
  ICard,
  ICardFilters,
  ICardInput,
  ICardsPage,
  IImportCardsResult,
  IReviewOption,
  IReviewResult,
  TReviewRating,
} from "./types";
export class CardService {
  async list(params: ICardFilters) {
    return (await http.get<ICardsPage>("/cards", { params })).data;
  }
  async getById(id: string) {
    return (await http.get<ICard>(`/cards/${id}`)).data;
  }
  async create(input: ICardInput) {
    return (await http.post<ICard>("/cards", input)).data;
  }
  async update(id: string, input: Partial<Omit<ICardInput, "studyDomainId">>) {
    return (await http.patch<ICard>(`/cards/${id}`, input)).data;
  }
  async remove(id: string) {
    await http.delete(`/cards/${id}`);
  }
  async removeMany(ids: string[]) {
    return (await http.delete<IBulkDeleteResult>("/cards/bulk", { data: { ids } })).data;
  }
  /** Consulta os intervalos previstos sem registrar uma resposta. */
  async reviewOptions(id: string) {
    return (await http.get<IReviewOption[]>(`/cards/${id}/review-options`)).data;
  }
  /** Registra a qualidade da lembrança e recebe a nova agenda SM-2. */
  async review(id: string, rating: TReviewRating) {
    return (await http.post<IReviewResult>(`/cards/${id}/reviews`, { rating })).data;
  }
  /** Cria vários cards usando o formato pergunta;resposta ou pergunta<TAB>resposta. */
  async importBlock(studyDomainId: string, text: string) {
    return (await http.post<IImportCardsResult>("/cards/import", { studyDomainId, text })).data;
  }
}
export const cardService = new CardService();
