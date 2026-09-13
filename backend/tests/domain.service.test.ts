import type { ICardRepository } from "../src/repositories/cards/types";
import type { IDomainRepository } from "../src/repositories/domains/types";
import { DomainService } from "../src/services/domains/domain.service";
import type { IStudyDomain } from "../src/services/domains/types";

const domain: IStudyDomain = { id: "domain-1", name: "Cardiologia", nameNormalized: "cardiologia", createdAt: new Date(), updatedAt: new Date() };

describe("DomainService", () => {
  it("normaliza o nome antes de encaminhá-lo ao repositório", async () => {
    const repository: IDomainRepository = { create: jest.fn().mockResolvedValue(domain), findById: jest.fn(), findByNormalizedName: jest.fn().mockResolvedValue(null), list: jest.fn(), updateName: jest.fn(), deleteById: jest.fn() };
    const service = new DomainService(repository);
    await expect(service.create({ id: domain.id, name: "  Cardiologia  " })).resolves.toEqual(domain);
    expect(repository.findByNormalizedName).toHaveBeenCalledWith("cardiologia");
    expect(repository.create).toHaveBeenCalledWith({ id: domain.id, name: "  Cardiologia  " });
  });

  it("retorna conflito quando há domínio com mesmo nome normalizado", async () => {
    const repository: IDomainRepository = { create: jest.fn(), findById: jest.fn(), findByNormalizedName: jest.fn().mockResolvedValue(domain), list: jest.fn(), updateName: jest.fn(), deleteById: jest.fn() };
    await expect(new DomainService(repository).create({ id: "domain-2", name: " cardiologia " })).rejects.toMatchObject({ code: "STUDY_DOMAIN_ALREADY_EXISTS", statusCode: 409 });
  });

  it("exclui os cards antes do domínio", async () => {
    const repository: IDomainRepository = { create: jest.fn(), findById: jest.fn().mockResolvedValue(domain), findByNormalizedName: jest.fn(), list: jest.fn(), updateName: jest.fn(), deleteById: jest.fn().mockResolvedValue(true) };
    const cards: ICardRepository = { create: jest.fn(), createMany: jest.fn(), findById: jest.fn(), findExact: jest.fn(), list: jest.fn(), update: jest.fn(), deleteById: jest.fn(), deleteByStudyDomainId: jest.fn().mockResolvedValue(2), updateSchedule: jest.fn() };
    await new DomainService(repository, cards).delete(domain.id);
    expect(cards.deleteByStudyDomainId).toHaveBeenCalledWith(domain.id);
    expect(repository.deleteById).toHaveBeenCalledWith(domain.id);
  });
});
