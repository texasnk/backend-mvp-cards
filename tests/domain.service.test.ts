import { DomainRepository } from "../src/modules/domains/domain.repository";
import { DomainService } from "../src/modules/domains/domain.service";
import type { DatabaseClient, QueryResult } from "../src/shared/db/database.types";

describe("DomainService", () => {
  it("rejects duplicate normalized names", async () => {
  const existingRow = {
    id: "domain-1",
    name: "Cardiologia",
    name_normalized: "cardiologia",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const db: DatabaseClient = {
    async query(): Promise<QueryResult<any>> {
      return {
        rows: [existingRow],
        rowCount: 1,
      };
    },
  };

  const service = new DomainService(new DomainRepository(db));

    await expect(
      service.create({
        id: "domain-2",
        name: "Cardiologia",
      }),
    ).rejects.toThrow(/already exists/i);
  });
});
