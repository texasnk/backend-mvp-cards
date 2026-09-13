import { NotFoundError } from "../../shared/errors/app-error";
import { handleServiceError } from "../../shared/errors/error-handler";
import { Sm2Scheduler } from "../../modules/reviews/sm2-scheduler";
import type { IReviewRepository } from "../../repositories/reviews/types";
import type {
  ReviewOption,
  ReviewRating,
  ReviewResult,
  ReviewSchedule,
  IReviewCardService,
} from "./types";

/** SPEC-REV-14: Serviço que aplica respostas de estudo e disponibiliza previsões. */
export class ReviewService {
  constructor(
    private readonly cards: IReviewCardService,
    private readonly repository: IReviewRepository,
    private readonly scheduler: Sm2Scheduler,
    private readonly now: () => Date = () => new Date(),
  ) {}
  /** SPEC-REV-15: Lista os efeitos previstos para Again, Hard, Good e Easy. */
  async options(cardId: string): Promise<ReviewOption[]> {
    return handleServiceError(async () => {
      const card = await this.cards.getById(cardId);
      return this.scheduler.getOptions(this.readSchedule(card), this.now());
    }, "Não foi possível consultar as opções de revisão.");
  }
  /** SPEC-REV-16: Registra uma resposta e atualiza o agendamento do card. */
  async answer(cardId: string, rating: ReviewRating): Promise<ReviewResult> {
    return handleServiceError(async () => {
      const card = await this.cards.getById(cardId);
      const current = this.readSchedule(card);
      const schedule = this.scheduler.schedule(current, rating, this.now());
      await this.cards.updateSchedule({ id: cardId, ...schedule });
      await this.repository.create({ cardId, rating, previousState: current.state, schedule });
      return { cardId, rating, previousState: current.state, schedule };
    }, "Não foi possível registrar a revisão do card.");
  }
  /** SPEC-REV-17: Normaliza o estado de cards antigos que ainda não têm agenda. */
  private readSchedule(card: {
    state?: string;
    dueAt?: Date;
    learningStep?: number;
    intervalDays?: number;
    easeFactor?: number;
  }): ReviewSchedule {
    const state =
      card.state === "learning" ||
      card.state === "review" ||
      card.state === "relearn"
        ? card.state
        : "new";
    return {
      state,
      dueAt: card.dueAt ?? this.now(),
      learningStep: card.learningStep ?? 0,
      intervalDays: card.intervalDays ?? 0,
      easeFactor: card.easeFactor ?? 2.5,
    };
  }
}
