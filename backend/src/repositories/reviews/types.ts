import type { ReviewRating, ReviewSchedule } from "../../services/reviews/types";

/** SPEC-ORM-02: Define as operações de persistência de revisões. */
export interface IReviewRepository {
  create(input: {
    cardId: string;
    rating: ReviewRating;
    previousState: string;
    schedule: ReviewSchedule;
  }): Promise<void>;
}
