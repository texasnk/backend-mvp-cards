export const REVIEW_RATINGS = ["again", "hard", "good", "easy"] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];
export const CARD_STATES = ["new", "learning", "review", "relearn"] as const;
export type CardState = (typeof CARD_STATES)[number];

export interface ReviewSchedule {
  state: CardState;
  dueAt: Date;
  learningStep: number;
  intervalDays: number;
  easeFactor: number;
}
export interface ReviewOption {
  rating: ReviewRating;
  dueAt: Date;
  intervalDays: number;
}
export interface ReviewResult {
  cardId: string;
  rating: ReviewRating;
  previousState: CardState;
  schedule: ReviewSchedule;
}

/** SPEC-ORM-02: Define as operações de card usadas em uma revisão. */
export interface IReviewCardService {
  getById(id: string): Promise<{
    state?: string;
    dueAt?: Date;
    learningStep?: number;
    intervalDays?: number;
    easeFactor?: number;
  }>;
  updateSchedule(input: { id: string } & ReviewSchedule): Promise<void>;
}
