import { strict as assert } from "node:assert";
import { DomainRepository } from "../src/modules/domains/domain.repository";
import { DomainService } from "../src/modules/domains/domain.service";
import type { DatabaseClient, QueryResult } from "../src/shared/db/database.types";

void testDomainServiceDuplicateProtection();

async function testDomainServiceDuplicateProtection(): Promise<void> {
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

  await assert.rejects(
    () =>
      service.create({
        id: "domain-2",
        name: "Cardiologia",
      }),
    /already exists/i,
  );
}

