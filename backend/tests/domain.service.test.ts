import { DomainRepository } from "../src/modules/domains/domain.repository";
import { DomainService } from "../src/modules/domains/domain.service";
import type { DatabaseClient, QueryResult, QueryResultRow } from "../src/shared/db/database.types";

interface DomainRow extends QueryResultRow {
  id: string;
  name: string;
  name_normalized: string;
  created_at: string;
  updated_at: string;
}

describe("DomainService", () => {
  it("creates a domain with trimmed and normalized name", async () => {
    const fixture = createDomainFixture();
    const service = fixture.service;

    const created = await service.create({
      id: "domain-1",
      name: "  Cardiologia  ",
    });

    expect(created.id).toBe("domain-1");
    expect(created.name).toBe("Cardiologia");
    expect(created.nameNormalized).toBe("cardiologia");

    const persisted = await service.getById("domain-1");
    expect(persisted.name).toBe("Cardiologia");
    expect(persisted.nameNormalized).toBe("cardiologia");
  });

  it("rejects duplicate normalized names on create", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
    ]);

    await expect(
      fixture.service.create({
        id: "domain-2",
        name: "  cardiologia  ",
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it("returns a domain by id", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
    ]);

    const domain = await fixture.service.getById("domain-1");

    expect(domain).toMatchObject({
      id: "domain-1",
      name: "Cardiologia",
      nameNormalized: "cardiologia",
    });
    expect(domain.createdAt).toBeInstanceOf(Date);
    expect(domain.updatedAt).toBeInstanceOf(Date);
  });

  it("fails when the requested domain does not exist", async () => {
    const fixture = createDomainFixture();

    await expect(fixture.service.getById("missing-domain")).rejects.toThrow(/not found/i);
  });

  it("lists domains with search and pagination", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Anatomia",
        name_normalized: "anatomia",
      }),
      buildDomainRow({
        id: "domain-2",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
      buildDomainRow({
        id: "domain-3",
        name: "Farmacologia",
        name_normalized: "farmacologia",
      }),
    ]);

    const page = await fixture.service.list({
      search: "logia",
      page: 1,
      pageSize: 1,
    });

    expect(page.total).toBe(2);
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(1);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.name).toBe("Cardiologia");
  });

  it("updates an existing domain name", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
    ]);

    const updated = await fixture.service.update({
      id: "domain-1",
      name: "Cardiologia Clinica",
    });

    expect(updated.name).toBe("Cardiologia Clinica");
    expect(updated.nameNormalized).toBe("cardiologia clinica");

    const persisted = await fixture.service.getById("domain-1");
    expect(persisted.name).toBe("Cardiologia Clinica");
  });

  it("rejects update when the new normalized name already exists in another domain", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
      buildDomainRow({
        id: "domain-2",
        name: "Farmacologia",
        name_normalized: "farmacologia",
      }),
    ]);

    await expect(
      fixture.service.update({
        id: "domain-1",
        name: "  farmacologia ",
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it("deletes an existing domain", async () => {
    const fixture = createDomainFixture([
      buildDomainRow({
        id: "domain-1",
        name: "Cardiologia",
        name_normalized: "cardiologia",
      }),
    ]);

    await fixture.service.delete("domain-1");

    await expect(fixture.service.getById("domain-1")).rejects.toThrow(/not found/i);
  });

  it("fails on delete when the domain does not exist", async () => {
    const fixture = createDomainFixture();

    await expect(fixture.service.delete("missing-domain")).rejects.toThrow(/not found/i);
  });
});

function createDomainFixture(seed: DomainRow[] = []): {
  service: DomainService;
  repository: DomainRepository;
  db: DatabaseClient;
} {
  const state = seed.map((row) => ({ ...row }));

  const db: DatabaseClient = {
    async query<T extends QueryResultRow = QueryResultRow>(
      sql: string,
      params: readonly unknown[] = [],
    ): Promise<QueryResult<T>> {
      if (sql.includes("insert into study_domains")) {
        const now = new Date().toISOString();
        const row: DomainRow = {
          id: String(params[0]),
          name: String(params[1]),
          name_normalized: String(params[2]),
          created_at: now,
          updated_at: now,
        };

        state.push(row);

        return {
          rows: asResultRows<T>([row]),
          rowCount: 1,
        };
      }

      if (sql.includes("delete from study_domains")) {
        const before = state.length;
        const nextState = state.filter((row) => row.id !== params[0]);
        state.splice(0, state.length, ...nextState);

        return {
          rows: [],
          rowCount: before === state.length ? 0 : 1,
        };
      }

      if (sql.includes("from study_domains") && sql.includes("where id = $1")) {
        const found = state.find((row) => row.id === params[0]);
        return {
          rows: found ? asResultRows<T>([found]) : [],
          rowCount: found ? 1 : 0,
        };
      }

      if (sql.includes("from study_domains") && sql.includes("where name_normalized = $1")) {
        const found = state.find((row) => row.name_normalized === params[0]);
        return {
          rows: found ? asResultRows<T>([found]) : [],
          rowCount: found ? 1 : 0,
        };
      }

      if (sql.includes("select count(*)::text as total")) {
        const filtered = filterRowsBySearch(state, params[0]);
        return {
          rows: asResultRows<T>([{ total: String(filtered.length) }]),
          rowCount: 1,
        };
      }

      if (sql.includes("order by name asc")) {
        const hasSearch = sql.includes("where name ilike $1");
        const pageSize = Number(params[hasSearch ? 1 : 0]);
        const offset = Number(params[hasSearch ? 2 : 1]);
        const filtered = filterRowsBySearch(state, hasSearch ? params[0] : undefined)
          .sort((left, right) => left.name.localeCompare(right.name))
          .slice(offset, offset + pageSize);

        return {
          rows: asResultRows<T>(filtered),
          rowCount: filtered.length,
        };
      }

      if (sql.includes("update study_domains")) {
        const index = state.findIndex((row) => row.id === params[0]);

        if (index === -1) {
          return { rows: [], rowCount: 0 };
        }

        const current = state[index];
        const updated: DomainRow = {
          ...current,
          name: String(params[1]),
          name_normalized: String(params[2]),
          updated_at: new Date().toISOString(),
        };

        state[index] = updated;

        return {
          rows: asResultRows<T>([updated]),
          rowCount: 1,
        };
      }

      throw new Error(`Unhandled SQL in test double: ${sql}`);
    },
  };

  const repository = new DomainRepository(db);
  const service = new DomainService(repository);

  return { service, repository, db };
}

function buildDomainRow(input: {
  id: string;
  name: string;
  name_normalized: string;
}): DomainRow {
  const timestamp = new Date().toISOString();

  return {
    ...input,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function filterRowsBySearch(rows: DomainRow[], searchValue: unknown): DomainRow[] {
  if (typeof searchValue !== "string") {
    return [...rows];
  }

  const normalizedSearch = searchValue.replaceAll("%", "").toLowerCase();

  return rows.filter((row) => row.name.toLowerCase().includes(normalizedSearch));
}

function asResultRows<T extends QueryResultRow>(rows: QueryResultRow[]): T[] {
  return rows as unknown as T[];
}
