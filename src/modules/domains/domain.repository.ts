import type { DatabaseClient, QueryResultRow } from "../../shared/db/database.types";
import type { PaginatedResult } from "../../shared/types/pagination.types";
import {
  buildStudyDomain,
  type CreateStudyDomainInput,
  type ListStudyDomainsFilters,
  type StudyDomain,
  type UpdateStudyDomainInput,
} from "./domain.types";

interface StudyDomainRow extends QueryResultRow {
  id: string;
  name: string;
  name_normalized: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CountRow extends QueryResultRow {
  total: string;
}

export class DomainRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: CreateStudyDomainInput): Promise<StudyDomain> {
    const domain = buildStudyDomain(input);
    const result = await this.db.query<StudyDomainRow>(
      `
        insert into study_domains (
          id,
          name,
          name_normalized
        ) values ($1, $2, $3)
        returning
          id,
          name,
          name_normalized,
          created_at,
          updated_at
      `,
      [domain.id, domain.name, domain.nameNormalized],
    );

    return mapStudyDomainRow(result.rows[0]);
  }

  async findById(id: string): Promise<StudyDomain | null> {
    const result = await this.db.query<StudyDomainRow>(
      `
        select
          id,
          name,
          name_normalized,
          created_at,
          updated_at
        from study_domains
        where id = $1
      `,
      [id],
    );

    return result.rowCount === 0 ? null : mapStudyDomainRow(result.rows[0]);
  }

  async findByNormalizedName(nameNormalized: string): Promise<StudyDomain | null> {
    const result = await this.db.query<StudyDomainRow>(
      `
        select
          id,
          name,
          name_normalized,
          created_at,
          updated_at
        from study_domains
        where name_normalized = $1
      `,
      [nameNormalized],
    );

    return result.rowCount === 0 ? null : mapStudyDomainRow(result.rows[0]);
  }

  async list(filters: ListStudyDomainsFilters): Promise<PaginatedResult<StudyDomain>> {
    const page = Math.max(filters.page, 1);
    const pageSize = Math.max(filters.pageSize, 1);
    const offset = (page - 1) * pageSize;
    const search = filters.search?.trim();
    const countParams: unknown[] = [];
    const dataParams: unknown[] = [];
    let whereClause = "";

    if (search) {
      whereClause = "where name ilike $1";
      countParams.push(`%${search}%`);
      dataParams.push(`%${search}%`);
    }

    const countResult = await this.db.query<CountRow>(
      `
        select count(*)::text as total
        from study_domains
        ${whereClause}
      `,
      countParams,
    );

    dataParams.push(pageSize, offset);

    const limitPosition = search ? 2 : 1;
    const offsetPosition = search ? 3 : 2;
    const itemsResult = await this.db.query<StudyDomainRow>(
      `
        select
          id,
          name,
          name_normalized,
          created_at,
          updated_at
        from study_domains
        ${whereClause}
        order by name asc
        limit $${limitPosition}
        offset $${offsetPosition}
      `,
      dataParams,
    );

    return {
      items: itemsResult.rows.map(mapStudyDomainRow),
      page,
      pageSize,
      total: Number(countResult.rows[0]?.total ?? 0),
    };
  }

  async updateName(input: UpdateStudyDomainInput): Promise<StudyDomain | null> {
    const domain = buildStudyDomain(input);
    const result = await this.db.query<StudyDomainRow>(
      `
        update study_domains
        set
          name = $2,
          name_normalized = $3,
          updated_at = now()
        where id = $1
        returning
          id,
          name,
          name_normalized,
          created_at,
          updated_at
      `,
      [input.id, domain.name, domain.nameNormalized],
    );

    return result.rowCount === 0 ? null : mapStudyDomainRow(result.rows[0]);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.db.query(
      `
        delete from study_domains
        where id = $1
      `,
      [id],
    );

    return result.rowCount > 0;
  }
}

function mapStudyDomainRow(row: StudyDomainRow): StudyDomain {
  return {
    id: row.id,
    name: row.name,
    nameNormalized: row.name_normalized,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

