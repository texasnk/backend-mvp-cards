import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";
import {
  REVIEW_RATINGS,
  type ReviewRating,
} from "../../services/reviews/types";
import { ReviewService } from "../../services/reviews/review.service";

/** SPEC-REV-20: Controller fino para consultas e respostas de revisão. */
export class ReviewController {
  constructor(private readonly service: ReviewService) {}
  /** SPEC-REV-21: Expõe as previsões antes de uma resposta. */
  options = async (request: Request, response: Response): Promise<void> => {
    response
      .status(200)
      .json(await this.service.options(String(request.params.id)));
  };
  /** SPEC-REV-22: Recebe uma das quatro opções válidas de memória. */
  answer = async (request: Request, response: Response): Promise<void> => {
    const rating = request.body?.rating;
    if (
      typeof rating !== "string" ||
      !REVIEW_RATINGS.includes(rating as ReviewRating)
    )
      throw new ValidationError(
        'Field "rating" must be again, hard, good or easy.',
        "INVALID_REVIEW_RATING",
      );
    response
      .status(200)
      .json(
        await this.service.answer(
          String(request.params.id),
          rating as ReviewRating,
        ),
      );
  };
}
