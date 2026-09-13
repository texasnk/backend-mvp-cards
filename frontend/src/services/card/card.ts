import { http } from "../http";
import type { ICard, ICardFilters, ICardInput, ICardsPage } from "./types";
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
}
export const cardService = new CardService();
