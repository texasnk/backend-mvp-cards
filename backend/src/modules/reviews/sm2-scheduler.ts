import type {
  CardState,
  ReviewOption,
  ReviewRating,
  ReviewSchedule,
} from "../../services/reviews/types";

const MINUTE = 60_000;
const LEARNING_STEPS = [1, 10];

/** SPEC-REV-05: Calcula previsões e transições SM-2 simplificadas para cards. */
export class Sm2Scheduler {
  /** SPEC-REV-06: Retorna o intervalo previsto para cada opção sem alterar o card. */
  getOptions(schedule: ReviewSchedule, now: Date): ReviewOption[] {
    return (["again", "hard", "good", "easy"] as ReviewRating[]).map(
      (rating) => {
        const next = this.schedule(schedule, rating, now);
        return { rating, dueAt: next.dueAt, intervalDays: next.intervalDays };
      },
    );
  }

  /** SPEC-REV-07: Aplica uma resposta seguindo aprendizado, revisão e reaprendizado. */
  schedule(
    current: ReviewSchedule,
    rating: ReviewRating,
    now: Date,
  ): ReviewSchedule {
    if (current.state === "review")
      return this.scheduleReview(current, rating, now);
    return this.scheduleLearning(current, rating, now);
  }

  /** SPEC-REV-08: Agenda cards novos, em aprendizado ou reaprendizado. */
  private scheduleLearning(
    current: ReviewSchedule,
    rating: ReviewRating,
    now: Date,
  ): ReviewSchedule {
    if (rating === "again")
      return this.minutes("learning", 0, 1, current.easeFactor, now);
    if (rating === "easy")
      return this.days(
        "review",
        0,
        4,
        Math.min(3, current.easeFactor + 0.15),
        now,
      );
    if (rating === "hard")
      return this.minutes(
        current.state === "relearn" ? "relearn" : "learning",
        1,
        10,
        Math.max(1.3, current.easeFactor - 0.15),
        now,
      );
    if (current.learningStep < LEARNING_STEPS.length - 1)
      return this.minutes(
        "learning",
        1,
        LEARNING_STEPS[1],
        current.easeFactor,
        now,
      );
    return this.days(
      "review",
      0,
      Math.max(1, current.intervalDays || 1),
      current.easeFactor,
      now,
    );
  }

  /** SPEC-REV-09: Aplica as variações SM-2 a cards consolidados em revisão. */
  private scheduleReview(
    current: ReviewSchedule,
    rating: ReviewRating,
    now: Date,
  ): ReviewSchedule {
    if (rating === "again")
      return this.minutes(
        "relearn",
        0,
        1,
        Math.max(1.3, current.easeFactor - 0.2),
        now,
      );
    const base = Math.max(1, current.intervalDays);
    if (rating === "hard")
      return this.days(
        "review",
        0,
        Math.max(1, Math.round(base * 1.2)),
        Math.max(1.3, current.easeFactor - 0.15),
        now,
      );
    if (rating === "easy")
      return this.days(
        "review",
        0,
        Math.max(1, Math.round(base * current.easeFactor * 1.3)),
        Math.min(3, current.easeFactor + 0.15),
        now,
      );
    return this.days(
      "review",
      0,
      Math.max(1, Math.round(base * current.easeFactor)),
      current.easeFactor,
      now,
    );
  }

  /** SPEC-REV-10: Cria uma agenda em minutos. */
  private minutes(
    state: CardState,
    learningStep: number,
    minutes: number,
    easeFactor: number,
    now: Date,
  ): ReviewSchedule {
    return {
      state,
      learningStep,
      intervalDays: 0,
      easeFactor,
      dueAt: new Date(now.getTime() + minutes * MINUTE),
    };
  }
  /** SPEC-REV-11: Cria uma agenda em dias. */
  private days(
    state: CardState,
    learningStep: number,
    intervalDays: number,
    easeFactor: number,
    now: Date,
  ): ReviewSchedule {
    return {
      state,
      learningStep,
      intervalDays,
      easeFactor,
      dueAt: new Date(now.getTime() + intervalDays * 86_400_000),
    };
  }
}
