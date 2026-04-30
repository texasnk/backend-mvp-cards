import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../modules/processing/processing.service";

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}

