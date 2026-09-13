import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadEnvironmentConfig } from "../src/shared/config/env";
import { PostgresConnectionManager } from "../src/shared/db/postgres.client";

async function main(): Promise<void> {
  const config = loadEnvironmentConfig();
  const connectionManager = new PostgresConnectionManager(config.databaseUrl);
  const db = connectionManager.getClient();
  const migrationsDirectory = join(process.cwd(), "src/shared/db/migrations");
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((entry) => entry.endsWith(".sql"))
    .sort();

  try {
    for (const migrationFile of migrationFiles) {
      const sql = await readFile(
        join(migrationsDirectory, migrationFile),
        "utf8",
      );
      await db.query(sql);
      console.log(`Applied migration: ${migrationFile}`);
    }
  } finally {
    await connectionManager.close();
  }
}

void main();
