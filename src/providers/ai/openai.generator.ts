import type {
  DomainClassificationResult,
  GeneratedCardDraft,
  GeneratedStudyMaterial,
  OpenAiProcessingProvider,
  SuggestedDomain,
} from "../../modules/processing/processing.service";
import { CARD_APPROACHES } from "../../modules/cards/card.types";
import type { CardApproach } from "../../modules/cards/card.types";
import type { StudyDomain } from "../../modules/domains/domain.types";
import { ExternalServiceError } from "../../shared/errors/app-error";
import { ProcessingPromptBuilder } from "../../modules/processing/prompt-builder";
import { OpenAiClient } from "./openai.client";

export class OpenAiGeneratorProvider implements OpenAiProcessingProvider {
  constructor(
    private readonly client: OpenAiClient,
    private readonly promptBuilder: ProcessingPromptBuilder,
  ) {}

  async classifyDomain(input: {
    text: string;
    domains: StudyDomain[];
  }): Promise<DomainClassificationResult> {
    const responseText = await this.client.createResponse({
      instructions: this.promptBuilder.buildClassificationInstructions(),
      input: this.promptBuilder.buildClassificationInput(input.text, input.domains),
      responseFormat: {
        type: "json_schema",
        name: "domain_classification",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["domainId", "confidence"],
          properties: {
            domainId: {
              anyOf: [{ type: "string" }, { type: "null" }],
            },
            confidence: {
              type: "number",
            },
          },
        },
      },
    });

    const parsed = parseJson(responseText);

    if (
      typeof parsed.confidence !== "number" ||
      (parsed.domainId !== null && typeof parsed.domainId !== "string")
    ) {
      throw new ExternalServiceError(
        "OpenAI returned an invalid domain classification payload.",
        "INVALID_OPENAI_CLASSIFICATION",
      );
    }

    return {
      domainId: parsed.domainId,
      confidence: parsed.confidence,
    };
  }

  async suggestDomain(input: { text: string }): Promise<SuggestedDomain | null> {
    const responseText = await this.client.createResponse({
      instructions: this.promptBuilder.buildSuggestionInstructions(),
      input: this.promptBuilder.buildSuggestionInput(input.text),
      responseFormat: {
        type: "json_schema",
        name: "domain_suggestion",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: {
            name: {
              anyOf: [{ type: "string" }, { type: "null" }],
            },
          },
        },
      },
    });

    const parsed = parseJson(responseText);

    if (parsed.name === null) {
      return null;
    }

    if (typeof parsed.name !== "string") {
      throw new ExternalServiceError(
        "OpenAI returned an invalid domain suggestion payload.",
        "INVALID_OPENAI_SUGGESTION",
      );
    }

    return { name: parsed.name };
  }

  async generateStudyMaterial(input: {
    text: string;
    cardsCount: number;
    language: "pt-BR";
  }): Promise<GeneratedStudyMaterial> {
    const responseText = await this.client.createResponse({
      instructions: this.promptBuilder.buildMaterialInstructions(input.cardsCount),
      input: this.promptBuilder.buildMaterialInput(input.text, input.cardsCount),
      responseFormat: {
        type: "json_schema",
        name: "study_material",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["summary", "cards"],
          properties: {
            summary: { type: "string" },
            cards: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["front", "back", "approach"],
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                  approach: { type: "string" },
                },
              },
            },
          },
        },
      },
    });

    const parsed = parseJson(responseText);

    if (typeof parsed.summary !== "string" || !Array.isArray(parsed.cards)) {
      throw new ExternalServiceError(
        "OpenAI returned an invalid study material payload.",
        "INVALID_OPENAI_STUDY_MATERIAL",
      );
    }

    return {
      summary: parsed.summary,
      cards: parsed.cards.map((card: Record<string, unknown>): GeneratedCardDraft => {
        if (
          !card ||
          typeof card !== "object" ||
          typeof card.front !== "string" ||
          typeof card.back !== "string" ||
          !isCardApproach(card.approach)
        ) {
          throw new ExternalServiceError(
            "OpenAI returned an invalid card payload.",
            "INVALID_OPENAI_CARD",
          );
        }

        return {
          front: card.front,
          back: card.back,
          approach: card.approach,
        };
      }),
    } as GeneratedStudyMaterial;
  }
}

function parseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    throw new ExternalServiceError("OpenAI returned invalid JSON.", "INVALID_OPENAI_JSON");
  }
}

function isCardApproach(value: unknown): value is CardApproach {
  return typeof value === "string" && CARD_APPROACHES.includes(value as CardApproach);
}
