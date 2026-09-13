import { CardRepository } from "../src/modules/cards/card.repository";
import { CardService } from "../src/modules/cards/card.service";
import { DomainRepository } from "../src/modules/domains/domain.repository";
import { DomainService } from "../src/modules/domains/domain.service";
import type { DatabaseClient, QueryResult } from "../src/shared/db/database.types";

describe("CardService", () => {
  it("requires an existing domain for manual cards", async () => {
  const db: DatabaseClient = {
    async query(sql: string): Promise<QueryResult<any>> {
      if (sql.includes("from study_domains")) {
        return { rows: [], rowCount: 0 };
      }

      return { rows: [], rowCount: 0 };
    },
  };

  const domainService = new DomainService(new DomainRepository(db));
  const cardService = new CardService(new CardRepository(db), domainService);

    await expect(
      cardService.createManual({
        id: "card-1",
        studyDomainId: "missing-domain",
        sourceType: "manual",
        front: "Pergunta",
        back: "Resposta",
      }),
    ).rejects.toThrow(/not found/i);
  });
});
