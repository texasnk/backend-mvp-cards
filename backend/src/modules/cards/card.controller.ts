import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { CardService } from "../../services/cards/card.service";
import {
  parseCardParams,
  parseCreateCardBody,
  parseListCardsQuery,
  parseUpdateCardBody,
  parseImportCardsBody,
  parseDeleteManyCardsBody,
} from "./card.schemas";
import { parseCardBlock } from "../reviews/block-card-parser";

export class CardController {
  constructor(private readonly cardService: CardService) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseCreateCardBody(request.body);
    const card = await this.cardService.createManual({
      id: randomUUID(),
      studyDomainId: body.studyDomainId,
      front: body.front,
      back: body.back,
      approach: body.approach,
      sourceType: "manual",
    });

    response.status(201).json(card);
  };

  /** SPEC-IMP-06: Importa linhas pergunta;resposta ou pergunta<TAB>resposta. */
  importBlock = async (request: Request, response: Response): Promise<void> => {
    const body = parseImportCardsBody(request.body);
    const result = await this.cardService.createManualBatchIgnoringDuplicates(
      parseCardBlock(body.text).map((card) => ({
        id: randomUUID(),
        studyDomainId: body.studyDomainId,
        sourceType: "manual",
        ...card,
      })),
    );
    response.status(201).json({ ...result, total: result.items.length });
  };

  list = async (request: Request, response: Response): Promise<void> => {
    const query = parseListCardsQuery(request.query);
    const result = await this.cardService.list(query);
    response.status(200).json(result);
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    const params = parseCardParams(request.params);
    const card = await this.cardService.getById(params.id);
    response.status(200).json(card);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const params = parseCardParams(request.params);
    const body = parseUpdateCardBody(request.body);
    const card = await this.cardService.update({
      id: params.id,
      front: body.front,
      back: body.back,
      approach: body.approach,
    });

    response.status(200).json(card);
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const params = parseCardParams(request.params);
    await this.cardService.delete(params.id);
    response.status(204).send();
  };

  /** SPEC-CARD-36: Expõe a exclusão parcial de cards. */
  deleteMany = async (request: Request, response: Response): Promise<void> => {
    response
      .status(200)
      .json(
        await this.cardService.deleteMany(
          parseDeleteManyCardsBody(request.body).ids,
        ),
      );
  };
}
