import type { PrismaClient } from "@prisma/client";
import type { IReviewRepository } from "./types";

/** SPEC-REV-12: Repositório Prisma do histórico de respostas SM-2. */
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** SPEC-REV-13: Persiste o evento de revisão calculado. */
  async create(input: Parameters<IReviewRepository["create"]>[0]): Promise<void> {
    await this.prisma.cardReview.create({
      data: {
        cardId: input.cardId,
        rating: input.rating,
        previousState: input.previousState,
        nextState: input.schedule.state,
        dueAt: input.schedule.dueAt,
        intervalDays: input.schedule.intervalDays,
        easeFactor: input.schedule.easeFactor,
      },
    });
  }
}
