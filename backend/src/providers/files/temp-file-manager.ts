import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export class TempFileManager {
  async createTempDirectory(prefix = "cards-mvp-"): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
  }

  async cleanup(path: string): Promise<void> {
    await rm(path, {
      recursive: true,
      force: true,
    });
  }
}
