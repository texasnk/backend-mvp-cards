import { NotFoundError } from "../../shared/errors/app-error";
import { CardRepository } from "./card.repository";
import type { Card, CreateCardInput, ListCardsFilters, UpdateCardInput } from "./card.types";
import { DomainService } from "../domains/domain.service";

export interface CreateGeneratedCardInput {
  id: string;
  studyDomainId: string;
  front: string;
  back: string;
  approach: CreateCardInput["approach"];
}

export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly domainService: DomainService,
  ) {}

  async createManual(input: CreateCardInput): Promise<Card> {
    await this.domainService.getById(input.studyDomainId);

    return this.cardRepository.create({
      ...input,
      sourceType: "manual",
    });
  }

  async getById(id: string): Promise<Card> {
    const card = await this.cardRepository.findById(id);

    if (!card) {
      throw new NotFoundError(`Card ${id} was not found.`, "CARD_NOT_FOUND");
    }

    return card;
  }

  async list(filters: ListCardsFilters) {
    if (filters.studyDomainId) {
      await this.domainService.getById(filters.studyDomainId);
    }

    return this.cardRepository.list(filters);
  }

  async update(input: UpdateCardInput): Promise<Card> {
    await this.getById(input.id);

    const updatedCard = await this.cardRepository.update(input);

    if (!updatedCard) {
      throw new NotFoundError(`Card ${input.id} was not found.`, "CARD_NOT_FOUND");
    }

    return updatedCard;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.cardRepository.deleteById(id);
  }

  async persistGeneratedCards(cards: CreateGeneratedCardInput[]): Promise<Card[]> {
    if (cards.length === 0) {
      return [];
    }

    await this.domainService.getById(cards[0].studyDomainId);

    return this.cardRepository.createMany(
      cards.map((card) => ({
        ...card,
        sourceType: "generated",
      })),
    );
  }
}

