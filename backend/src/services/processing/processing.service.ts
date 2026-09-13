import type { IGeneratedCardsService, CardApproach } from "../cards/types";
import type { IDomainLookupService, IStudyDomain } from "../domains/types";
import type { IProcessingRequestRepository } from "../../repositories/processing/types";
import type { ProcessingInputType } from "./types";
import {
  ExternalServiceError,
  NotFoundError,
  TimeoutError,
  ValidationError,
} from "../../shared/errors/app-error";
import { toAppError } from "../../shared/errors/error-handler";

export interface TextProcessingInput {
  requestId: string;
  inputType: "text";
  text: string;
  domainId?: string;
  cardsCount?: number;
}

export interface FileProcessingInput {
  requestId: string;
  inputType: "image" | "pdf";
  file: ProcessingFileReference;
  domainId?: string;
  cardsCount?: number;
}

export type ProcessingServiceInput = TextProcessingInput | FileProcessingInput;

export interface ProcessingFileReference {
  path: string;
  mimeType: string;
  originalName: string;
}

export interface GeneratedCardDraft {
  front: string;
  back: string;
  approach: CardApproach;
}

export interface GeneratedStudyMaterial {
  summary: string;
  cards: GeneratedCardDraft[];
}

export interface DomainClassificationResult {
  domainId: string | null;
  confidence: number;
}

export interface SuggestedDomain {
  name: string;
}

export interface ResolvedProcessingDomain {
  mode: "provided" | "classified";
  id: string;
  name: string;
}

export interface ProcessingServiceResult {
  requestId: string;
  inputType: ProcessingInputType;
  summary: string;
  domain: ResolvedProcessingDomain | null;
  suggestedDomain: SuggestedDomain | null;
  cards: Array<{
    id: string | null;
    front: string;
    back: string;
    approach: CardApproach;
  }>;
}

export interface TextSanitizer {
  sanitizeText(text: string): string;
}

export interface PdfTextExtractor {
  extractText(file: ProcessingFileReference): Promise<string>;
}

export interface VisionOcrProvider {
  extractTextFromImage(file: ProcessingFileReference): Promise<string>;
}

export interface OpenAiProcessingProvider {
  classifyDomain(input: {
    text: string;
    domains: IStudyDomain[];
  }): Promise<DomainClassificationResult>;
  suggestDomain(input: { text: string }): Promise<SuggestedDomain | null>;
  generateStudyMaterial(input: {
    text: string;
    cardsCount: number;
    language: "pt-BR";
  }): Promise<GeneratedStudyMaterial>;
}

export interface IdGenerator {
  generate(): string;
}

export interface ProcessingServiceOptions {
  defaultCardsCount: number;
  maxCardsCount: number;
  minCardsCount: number;
  maxTextLength: number;
  minUsableTextLength: number;
  domainMatchThreshold: number;
}

interface DomainResolutionResult {
  domain: ResolvedProcessingDomain | null;
  suggestedDomain: SuggestedDomain | null;
}

export class ContentProcessingService {
  constructor(
    private readonly processingRequestRepository: IProcessingRequestRepository,
    private readonly domainService: IDomainLookupService,
    private readonly cardService: IGeneratedCardsService,
    private readonly textSanitizer: TextSanitizer,
    private readonly pdfTextExtractor: PdfTextExtractor,
    private readonly visionOcrProvider: VisionOcrProvider,
    private readonly openAiProvider: OpenAiProcessingProvider,
    private readonly idGenerator: IdGenerator,
    private readonly options: ProcessingServiceOptions,
  ) {}

  async process(
    input: ProcessingServiceInput,
  ): Promise<ProcessingServiceResult> {
    const cardsCount = this.resolveCardsCount(input.cardsCount);

    await this.processingRequestRepository.createStarted({
      id: input.requestId,
      inputType: input.inputType,
      providedDomainId: input.domainId ?? null,
      cardsRequested: cardsCount,
    });

    try {
      const extractedText = await this.extractUsableText(input);
      const domainResolution = await this.resolveDomain(
        input.domainId,
        extractedText,
      );
      const studyMaterial = await this.openAiProvider.generateStudyMaterial({
        text: extractedText,
        cardsCount,
        language: "pt-BR",
      });

      this.assertGeneratedStudyMaterial(studyMaterial, cardsCount);

      if (!domainResolution.domain) {
        await this.processingRequestRepository.markSucceededWithoutPersistence({
          id: input.requestId,
          cardsCreated: studyMaterial.cards.length,
          cardsPersisted: 0,
          suggestedDomainName: domainResolution.suggestedDomain?.name ?? null,
          extractedTextChars: extractedText.length,
        });

        return {
          requestId: input.requestId,
          inputType: input.inputType,
          summary: studyMaterial.summary,
          domain: null,
          suggestedDomain: domainResolution.suggestedDomain,
          cards: studyMaterial.cards.map((card) => ({
            id: null,
            front: card.front,
            back: card.back,
            approach: card.approach,
          })),
        };
      }

      const resolvedDomain = domainResolution.domain;

      const persistedCards = await this.cardService.persistGeneratedCards(
        studyMaterial.cards.map((card) => ({
          id: this.idGenerator.generate(),
          studyDomainId: resolvedDomain.id,
          front: card.front,
          back: card.back,
          approach: card.approach,
        })),
      );

      await this.processingRequestRepository.markSucceeded({
        id: input.requestId,
        resolvedDomainId: resolvedDomain.id,
        cardsCreated: studyMaterial.cards.length,
        cardsPersisted: persistedCards.length,
        suggestedDomainName: null,
        extractedTextChars: extractedText.length,
      });

      return {
        requestId: input.requestId,
        inputType: input.inputType,
        summary: studyMaterial.summary,
        domain: resolvedDomain,
        suggestedDomain: null,
        cards: persistedCards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          approach: card.approach as CardApproach,
        })),
      };
    } catch (error) {
      await this.processingRequestRepository.markFailed({
        id: input.requestId,
        failureCode: getFailureCode(error),
        failureReason: getFailureReason(error),
        extractedTextChars: 0,
      });

      throw toAppError(error, "Não foi possível processar o conteúdo informado.");
    }
  }

  private resolveCardsCount(cardsCount?: number): number {
    const resolvedCount = cardsCount ?? this.options.defaultCardsCount;

    if (
      resolvedCount < this.options.minCardsCount ||
      resolvedCount > this.options.maxCardsCount
    ) {
      throw new ValidationError(
        `Cards count must be between ${this.options.minCardsCount} and ${this.options.maxCardsCount}.`,
        "INVALID_CARDS_COUNT",
      );
    }

    return resolvedCount;
  }

  private async extractUsableText(
    input: ProcessingServiceInput,
  ): Promise<string> {
    let extractedText = "";

    if (input.inputType === "text") {
      extractedText = this.textSanitizer.sanitizeText(input.text);
    }

    if (input.inputType === "image") {
      extractedText = this.textSanitizer.sanitizeText(
        await this.visionOcrProvider.extractTextFromImage(input.file),
      );
    }

    if (input.inputType === "pdf") {
      extractedText = this.textSanitizer.sanitizeText(
        await this.pdfTextExtractor.extractText(input.file),
      );
    }

    if (extractedText.length > this.options.maxTextLength) {
      extractedText = extractedText.slice(0, this.options.maxTextLength);
    }

    if (extractedText.length < this.options.minUsableTextLength) {
      throw new ValidationError(
        "There is no usable textual content after extraction or OCR.",
        "UNUSABLE_CONTENT",
      );
    }

    return extractedText;
  }

  private async resolveDomain(
    providedDomainId: string | undefined,
    extractedText: string,
  ): Promise<DomainResolutionResult> {
    if (providedDomainId) {
      const providedDomain = await this.domainService.getById(providedDomainId);

      return {
        domain: {
          mode: "provided",
          id: providedDomain.id,
          name: providedDomain.name,
        },
        suggestedDomain: null,
      };
    }

    const domainsPage = await this.domainService.list({
      page: 1,
      pageSize: 100,
    });

    if (domainsPage.items.length === 0) {
      return {
        domain: null,
        suggestedDomain: await this.safelySuggestDomain(extractedText),
      };
    }

    const classification = await this.openAiProvider.classifyDomain({
      text: extractedText,
      domains: domainsPage.items,
    });

    if (
      classification.domainId &&
      classification.confidence >= this.options.domainMatchThreshold
    ) {
      const resolvedDomain = await this.domainService.getById(
        classification.domainId,
      );

      return {
        domain: {
          mode: "classified",
          id: resolvedDomain.id,
          name: resolvedDomain.name,
        },
        suggestedDomain: null,
      };
    }

    return {
      domain: null,
      suggestedDomain: await this.safelySuggestDomain(extractedText),
    };
  }

  private async safelySuggestDomain(
    text: string,
  ): Promise<SuggestedDomain | null> {
    const suggestion = await this.openAiProvider.suggestDomain({ text });

    if (!suggestion) {
      return null;
    }

    const suggestedName = suggestion.name.trim();

    if (suggestedName.length < 3 || suggestedName.length > 40) {
      return null;
    }

    return { name: suggestedName };
  }

  private assertGeneratedStudyMaterial(
    material: GeneratedStudyMaterial,
    requestedCardsCount: number,
  ): void {
    const summary = material.summary.trim();

    if (summary.length === 0) {
      throw new ExternalServiceError(
        "The AI provider returned an empty summary.",
        "INVALID_AI_SUMMARY",
      );
    }

    if (material.cards.length !== requestedCardsCount) {
      throw new ExternalServiceError(
        `The AI provider returned ${material.cards.length} cards, expected ${requestedCardsCount}.`,
        "INVALID_AI_CARDS_COUNT",
      );
    }

    for (const card of material.cards) {
      if (card.front.trim().length < 3 || card.back.trim().length < 3) {
        throw new ExternalServiceError(
          "The AI provider returned a card with invalid content length.",
          "INVALID_AI_CARD_CONTENT",
        );
      }
    }
  }
}

function getFailureCode(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.code;
  }

  if (error instanceof NotFoundError) {
    return error.code;
  }

  if (error instanceof TimeoutError) {
    return error.code;
  }

  if (error instanceof ExternalServiceError) {
    return error.code;
  }

  return "UNEXPECTED_PROCESSING_ERROR";
}

function getFailureReason(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected processing error.";
}
