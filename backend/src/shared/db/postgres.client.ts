import { Pool, type PoolClient, type QueryResult as PgQueryResult } from "pg";
import type {
  DatabaseClient,
  QueryResult,
  QueryResultRow,
} from "./database.types";

export class PostgresDatabaseClient implements DatabaseClient {
  constructor(private readonly client: Pool | PoolClient) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    const result: PgQueryResult = await this.client.query(
      sql,
      params as unknown[],
    );

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0,
    };
  }
}

export class PostgresConnectionManager {
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  getClient(): PostgresDatabaseClient {
    return new PostgresDatabaseClient(this.pool);
  }

  async withTransaction<T>(
    callback: (db: PostgresDatabaseClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      const db = new PostgresDatabaseClient(client);
      const result = await callback(db);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async ping(): Promise<void> {
    await this.pool.query("select 1");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
