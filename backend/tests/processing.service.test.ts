import type { IProcessingRequestRepository } from "../src/repositories/processing/types";
import { ContentProcessingService } from "../src/services/processing/processing.service";
import type { IGeneratedCardsService } from "../src/services/cards/types";
import type { IDomainLookupService } from "../src/services/domains/types";

describe("ContentProcessingService", () => {
  it("registra falha quando não existe texto utilizável", async () => {
    const requests: IProcessingRequestRepository = { createStarted: jest.fn().mockResolvedValue({}), markSucceeded: jest.fn(), markSucceededWithoutPersistence: jest.fn(), markFailed: jest.fn().mockResolvedValue({}), findById: jest.fn() };
    const domains: IDomainLookupService = { getById: jest.fn(), list: jest.fn() };
    const cards: IGeneratedCardsService = { persistGeneratedCards: jest.fn() };
    const service = new ContentProcessingService(requests, domains, cards, { sanitizeText: () => "" }, { extractText: jest.fn() }, { extractTextFromImage: jest.fn() }, { classifyDomain: jest.fn(), suggestDomain: jest.fn(), generateStudyMaterial: jest.fn() }, { generate: () => "card-1" }, { defaultCardsCount: 3, maxCardsCount: 10, minCardsCount: 1, maxTextLength: 10_000, minUsableTextLength: 5, domainMatchThreshold: 0.8 });
    await expect(service.process({ requestId: "request-1", inputType: "text", text: "oi" })).rejects.toMatchObject({ code: "UNUSABLE_CONTENT" });
    expect(requests.markFailed).toHaveBeenCalledWith(expect.objectContaining({ id: "request-1", failureCode: "UNUSABLE_CONTENT" }));
  });
});
