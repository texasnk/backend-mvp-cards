import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";
import { ContentProcessingService } from "./processing.service";
import { parseCreateProcessingBody } from "./processing.schemas";

export class ProcessingController {
  constructor(private readonly processingService: ContentProcessingService) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseCreateProcessingBody(request.body);

    if (!body.inputType || !body.text) {
      throw new ValidationError(
        'This stage supports only JSON text processing. Fields "inputType=text" and "text" are required.',
        "INVALID_PROCESSING_REQUEST",
      );
    }

    const result = await this.processingService.process({
      requestId: body.requestId ?? randomUUID(),
      inputType: "text",
      text: body.text,
      domainId: body.domainId,
      cardsCount: body.cardsCount,
    });

    response.status(200).json(result);
  };
}
