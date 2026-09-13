import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import multer from "multer";

export interface UploadMiddlewareOptions {
  maxFileSizeBytes: number;
}

export function createUploadMiddleware(options: UploadMiddlewareOptions) {
  const uploadDirectory = join(tmpdir(), "backend-mvp-cards-uploads");

  const storage = multer.diskStorage({
    destination: async (_request, _file, callback) => {
      try {
        await mkdir(uploadDirectory, { recursive: true });
        callback(null, uploadDirectory);
      } catch (error) {
        callback(error as Error, uploadDirectory);
      }
    },
    filename: (_request, file, callback) => {
      callback(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: options.maxFileSizeBytes,
      files: 1,
    },
  });
}
