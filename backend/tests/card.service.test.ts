import type { ICardRepository } from "../src/repositories/cards/types";
import { CardService } from "../src/services/cards/card.service";
import type { Card } from "../src/services/cards/types";
import type { IDomainLookupService } from "../src/services/domains/types";

describe("CardService", () => {
  it("exige um domínio existente antes de criar card manual", async () => {
    const cards: ICardRepository = { create: jest.fn(), createMany: jest.fn(), findById: jest.fn(), findExact: jest.fn(), list: jest.fn(), update: jest.fn(), deleteById: jest.fn(), deleteByStudyDomainId: jest.fn(), updateSchedule: jest.fn() };
    const domains: IDomainLookupService = { getById: jest.fn().mockRejectedValue(Object.assign(new Error("não encontrado"), { code: "STUDY_DOMAIN_NOT_FOUND" })), list: jest.fn() };
    const service = new CardService(cards, domains);
    await expect(service.createManual({ id: "card-1", studyDomainId: "missing", sourceType: "manual", front: "Pergunta", back: "Resposta" })).rejects.toThrow("não encontrado");
    expect(cards.create).not.toHaveBeenCalled();
  });

  it("recusa card idêntico no mesmo domínio", async () => {
    const existing: Card = { id: "card-1", studyDomainId: "domain-1", sourceType: "manual", approach: null, front: "Pergunta", back: "Resposta", createdAt: new Date(), updatedAt: new Date(), state: "new", dueAt: new Date(), learningStep: 0, intervalDays: 0, easeFactor: 2.5 };
    const cards: ICardRepository = { create: jest.fn(), createMany: jest.fn(), findById: jest.fn(), findExact: jest.fn().mockResolvedValue(existing), list: jest.fn(), update: jest.fn(), deleteById: jest.fn(), deleteByStudyDomainId: jest.fn(), updateSchedule: jest.fn() };
    const domains: IDomainLookupService = { getById: jest.fn().mockResolvedValue({ id: "domain-1", name: "Domínio", nameNormalized: "dominio", createdAt: new Date(), updatedAt: new Date() }), list: jest.fn() };
    await expect(new CardService(cards, domains).createManual({ id: "card-2", studyDomainId: "domain-1", sourceType: "manual", front: "Pergunta", back: "Resposta" })).rejects.toMatchObject({ code: "CARD_ALREADY_EXISTS" });
  });
});
