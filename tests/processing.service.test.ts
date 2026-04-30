import { CardRepository } from "../src/modules/cards/card.repository";
import { CardService } from "../src/modules/cards/card.service";
import { DomainRepository } from "../src/modules/domains/domain.repository";
import { DomainService } from "../src/modules/domains/domain.service";
import { ContentProcessingService } from "../src/modules/processing/processing.service";
import { ProcessingRequestRepository } from "../src/modules/processing/processing.repository";
import type { DatabaseClient, QueryResult } from "../src/shared/db/database.types";

describe("ContentProcessingService", () => {
  it("rejects content without usable extracted text", async () => {
  const db: DatabaseClient = {
    async query(sql: string): Promise<QueryResult<any>> {
      if (sql.includes("insert into processing_requests")) {
        return {
          rows: [
            {
              id: "request-1",
              input_type: "text",
              provided_domain_id: null,
              resolved_domain_id: null,
              status: "started",
              cards_requested: 3,
              cards_created: 0,
              cards_persisted: 0,
              suggested_domain_name: null,
              extracted_text_chars: 0,
              failure_code: null,
              failure_reason: null,
              started_at: new Date().toISOString(),
              finished_at: null,
            },
          ],
          rowCount: 1,
        };
      }

      if (sql.includes("update processing_requests")) {
        return {
          rows: [
            {
              id: "request-1",
              input_type: "text",
              provided_domain_id: null,
              resolved_domain_id: null,
              status: "failed",
              cards_requested: 3,
              cards_created: 0,
              cards_persisted: 0,
              suggested_domain_name: null,
              extracted_text_chars: 0,
              failure_code: "UNUSABLE_CONTENT",
              failure_reason: "There is no usable textual content after extraction or OCR.",
              started_at: new Date().toISOString(),
              finished_at: new Date().toISOString(),
            },
          ],
          rowCount: 1,
        };
      }

      return { rows: [], rowCount: 0 };
    },
  };

  const domainService = new DomainService(new DomainRepository(db));
  const cardService = new CardService(new CardRepository(db), domainService);
  const service = new ContentProcessingService(
    new ProcessingRequestRepository(db),
    domainService,
    cardService,
    {
      sanitizeText: () => "",
    },
    {
      extractText: async () => "",
    },
    {
      extractTextFromImage: async () => "",
    },
    {
      classifyDomain: async () => ({ domainId: null, confidence: 0 }),
      suggestDomain: async () => null,
      generateStudyMaterial: async () => ({ summary: "", cards: [] }),
    },
    {
      generate: () => "card-generated",
    },
    {
      defaultCardsCount: 3,
      maxCardsCount: 10,
      minCardsCount: 1,
      maxTextLength: 10_000,
      minUsableTextLength: 5,
      domainMatchThreshold: 0.8,
    },
  );

    await expect(
      service.process({
        requestId: "request-1",
        inputType: "text",
        text: "oi",
      }),
    ).rejects.toThrow(/usable textual content/i);
  });
});
