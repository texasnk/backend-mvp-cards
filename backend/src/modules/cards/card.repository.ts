import type { DatabaseClient, QueryResultRow } from "../../shared/db/database.types";
import type { PaginatedResult } from "../../shared/types/pagination.types";
import {
  assertCardTextField,
  buildCreateCardInput,
  type Card,
  type CardApproach,
  type CardSourceType,
  type CreateCardInput,
  type ListCardsFilters,
  type UpdateCardInput,
} from "./card.types";

interface CardRow extends QueryResultRow {
  id: string;
  study_domain_id: string;
  source_type: CardSourceType;
  approach: CardApproach | null;
  front: string;
  back: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CountRow extends QueryResultRow {
  total: string;
}

export class CardRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: CreateCardInput): Promise<Card> {
    const card = buildCreateCardInput(input);
    const result = await this.db.query<CardRow>(
      `
        insert into cards (
          id,
          study_domain_id,
          source_type,
          approach,
          front,
          back
        ) values ($1, $2, $3, $4, $5, $6)
        returning
          id,
          study_domain_id,
          source_type,
          approach,
          front,
          back,
          created_at,
          updated_at
      `,
      [
        card.id,
        card.studyDomainId,
        card.sourceType,
        card.approach,
        card.front,
        card.back,
      ],
    );

    return mapCardRow(result.rows[0]);
  }

  async createMany(inputs: CreateCardInput[]): Promise<Card[]> {
    const cards: Card[] = [];

    for (const input of inputs) {
      cards.push(await this.create(input));
    }

    return cards;
  }

  async findById(id: string): Promise<Card | null> {
    const result = await this.db.query<CardRow>(
      `
        select
          id,
          study_domain_id,
          source_type,
          approach,
          front,
          back,
          created_at,
          updated_at
        from cards
        where id = $1
      `,
      [id],
    );

    return result.rowCount === 0 ? null : mapCardRow(result.rows[0]);
  }

  async list(filters: ListCardsFilters): Promise<PaginatedResult<Card>> {
    const page = Math.max(filters.page, 1);
    const pageSize = Math.max(filters.pageSize, 1);
    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.studyDomainId) {
      params.push(filters.studyDomainId);
      conditions.push(`study_domain_id = $${params.length}`);
    }

    if (filters.sourceType) {
      params.push(filters.sourceType);
      conditions.push(`source_type = $${params.length}`);
    }

    if (filters.approach) {
      params.push(filters.approach);
      conditions.push(`approach = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

    const countResult = await this.db.query<CountRow>(
      `
        select count(*)::text as total
        from cards
        ${whereClause}
      `,
      params,
    );

    const dataParams = [...params, pageSize, offset];
    const limitPosition = params.length + 1;
    const offsetPosition = params.length + 2;
    const itemsResult = await this.db.query<CardRow>(
      `
        select
          id,
          study_domain_id,
          source_type,
          approach,
          front,
          back,
          created_at,
          updated_at
        from cards
        ${whereClause}
        order by created_at desc
        limit $${limitPosition}
        offset $${offsetPosition}
      `,
      dataParams,
    );

    return {
      items: itemsResult.rows.map(mapCardRow),
      page,
      pageSize,
      total: Number(countResult.rows[0]?.total ?? 0),
    };
  }

  async update(input: UpdateCardInput): Promise<Card | null> {
    const fields: string[] = [];
    const params: unknown[] = [input.id];

    if (input.front !== undefined) {
      assertCardTextField("front", input.front);
      params.push(input.front.trim());
      fields.push(`front = $${params.length}`);
    }

    if (input.back !== undefined) {
      assertCardTextField("back", input.back);
      params.push(input.back.trim());
      fields.push(`back = $${params.length}`);
    }

    if (input.approach !== undefined) {
      params.push(input.approach);
      fields.push(`approach = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.findById(input.id);
    }

    params.push(new Date());
    const updatedAtPosition = params.length;
    const result = await this.db.query<CardRow>(
      `
        update cards
        set
          ${fields.join(", ")},
          updated_at = $${updatedAtPosition}
        where id = $1
        returning
          id,
          study_domain_id,
          source_type,
          approach,
          front,
          back,
          created_at,
          updated_at
      `,
      params,
    );

    return result.rowCount === 0 ? null : mapCardRow(result.rows[0]);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.db.query(
      `
        delete from cards
        where id = $1
      `,
      [id],
    );

    return result.rowCount > 0;
  }
}

function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    studyDomainId: row.study_domain_id,
    sourceType: row.source_type,
    approach: row.approach,
    front: row.front,
    back: row.back,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
