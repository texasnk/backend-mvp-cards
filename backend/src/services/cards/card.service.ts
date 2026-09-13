import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import type { ICardRepository } from "../../repositories/cards/types";
import type {
  Card,
  CreateCardInput,
  ListCardsFilters,
  UpdateCardInput,
  UpdateCardScheduleInput,
} from "../../services/cards/types";
import type { IDomainLookupService } from "../domains/types";

export interface CreateGeneratedCardInput {
  id: string;
  studyDomainId: string;
  front: string;
  back: string;
  approach: CreateCardInput["approach"];
}

export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly domainService: IDomainLookupService,
  ) {}

  async createManual(input: CreateCardInput): Promise<Card> {
    await this.domainService.getById(input.studyDomainId);
    if (
      await this.cardRepository.findExact(
        input.studyDomainId,
        input.front,
        input.back,
      )
    ) {
      throw new ConflictError(
        "An identical card already exists in this study domain.",
        "CARD_ALREADY_EXISTS",
      );
    }

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
      throw new NotFoundError(
        `Card ${input.id} was not found.`,
        "CARD_NOT_FOUND",
      );
    }

    return updatedCard;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.cardRepository.deleteById(id);
  }

  /** SPEC-CARD-32: Exclui todos os IDs possíveis e registra as falhas. */
  async deleteMany(ids: string[]): Promise<{
    deletedIds: string[];
    failures: { id: string; code: string; message: string }[];
  }> {
    const deletedIds: string[] = [];
    const failures: { id: string; code: string; message: string }[] = [];
    for (const id of ids) {
      try {
        await this.delete(id);
        deletedIds.push(id);
      } catch (error) {
        failures.push({
          id,
          code: error instanceof NotFoundError ? error.code : "DELETE_FAILED",
          message:
            error instanceof Error ? error.message : "Unable to delete card.",
        });
      }
    }
    return { deletedIds, failures };
  }

  /** SPEC-REV-19: Persiste a agenda calculada pelo domínio de revisão. */
  async updateSchedule(input: UpdateCardScheduleInput): Promise<void> {
    await this.getById(input.id);
    if (!(await this.cardRepository.updateSchedule(input)))
      throw new NotFoundError(
        `Card ${input.id} was not found.`,
        "CARD_NOT_FOUND",
      );
  }
  /** SPEC-IMP-04: Cria cards válidos a partir do bloco já interpretado. */
  async createManualBatch(input: CreateCardInput[]): Promise<Card[]> {
    if (!input.length) return [];
    await this.domainService.getById(input[0].studyDomainId);
    return this.cardRepository.createMany(
      input.map((card) => ({ ...card, sourceType: "manual" })),
    );
  }

  /** SPEC-CARD-33: Cria os cards únicos e relata duplicados sem interromper o lote. */
  async createManualBatchIgnoringDuplicates(
    input: CreateCardInput[],
  ): Promise<{ items: Card[]; failures: { index: number; code: string }[] }> {
    if (input.length) await this.domainService.getById(input[0].studyDomainId);
    const items: Card[] = [];
    const failures: { index: number; code: string }[] = [];
    for (const [index, card] of input.entries()) {
      if (
        await this.cardRepository.findExact(
          card.studyDomainId,
          card.front,
          card.back,
        )
      )
        failures.push({ index: index + 1, code: "CARD_ALREADY_EXISTS" });
      else
        items.push(
          await this.cardRepository.create({ ...card, sourceType: "manual" }),
        );
    }
    return { items, failures };
  }

  async persistGeneratedCards(
    cards: CreateGeneratedCardInput[],
  ): Promise<Card[]> {
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
