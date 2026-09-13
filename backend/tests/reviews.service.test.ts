import { parseCardBlock } from "../src/modules/reviews/block-card-parser";
import { Sm2Scheduler } from "../src/modules/reviews/sm2-scheduler";
import { ReviewService } from "../src/services/reviews/review.service";
import type { ReviewSchedule } from "../src/services/reviews/types";
import type { IReviewCardService } from "../src/services/reviews/types";
import type { IReviewRepository } from "../src/repositories/reviews/types";

const NOW = new Date("2026-09-12T12:00:00.000Z");

describe("review domain", () => {
  it("parses semicolon and tab rows and rejects every other layout", () => {
    expect(
      parseCardBlock(
        "O que ÃƒÆ’Ã‚Â© REST?;Um estilo arquitetural\nO que ÃƒÆ’Ã‚Â© HTTP?\tUm protocolo",
      ),
    ).toEqual([
      { front: "O que ÃƒÆ’Ã‚Â© REST?", back: "Um estilo arquitetural" },
      { front: "O que ÃƒÆ’Ã‚Â© HTTP?", back: "Um protocolo" },
    ]);
    expect(() => parseCardBlock("pergunta sem resposta")).toThrow(
      "exactly one",
    );
    expect(() => parseCardBlock("uma;duas;trÃƒÆ’Ã‚Âªs")).toThrow("exactly one");
  });

  it("requires at least 3 characters in the question and 1 in the answer", () => {
    expect(parseCardBlock("Qual?;A")).toEqual([{ front: "Qual?", back: "A" }]);
    expect(() => parseCardBlock("ab;A")).toThrow(
      "question with at least 3 characters",
    );
    expect(() => parseCardBlock("Qual?; ")).toThrow(
      "answer with at least 1 character",
    );
  });

  it("moves a new card through learning and review with Good", () => {
    const scheduler = new Sm2Scheduler();
    const fresh: ReviewSchedule = {
      state: "new",
      dueAt: NOW,
      learningStep: 0,
      intervalDays: 0,
      easeFactor: 2.5,
    };
    const learning = scheduler.schedule(fresh, "good", NOW);
    expect(learning).toMatchObject({
      state: "learning",
      learningStep: 1,
      intervalDays: 0,
    });
    expect(learning.dueAt.getTime() - NOW.getTime()).toBe(10 * 60_000);
    expect(scheduler.schedule(learning, "good", NOW)).toMatchObject({
      state: "review",
      intervalDays: 1,
    });
  });

  it("uses service collaborators and records a Review Again as relearn", async () => {
    const cards: IReviewCardService = {
      getById: jest.fn().mockResolvedValue({
        id: "card-1",
        state: "review",
        dueAt: NOW,
        learningStep: 0,
        intervalDays: 6,
        easeFactor: 2.5,
      }),
      updateSchedule: jest.fn().mockResolvedValue(undefined),
    };
    const repository: IReviewRepository = { create: jest.fn().mockResolvedValue(undefined) };
    const service = new ReviewService(
      cards,
      repository,
      new Sm2Scheduler(),
      () => NOW,
    );
    const result = await service.answer("card-1", "again");
    expect(result).toMatchObject({
      cardId: "card-1",
      rating: "again",
      previousState: "review",
      schedule: { state: "relearn", intervalDays: 0, easeFactor: 2.3 },
    });
    expect(cards.updateSchedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: "card-1", state: "relearn" }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rating: "again", previousState: "review" }),
    );
  });
});
