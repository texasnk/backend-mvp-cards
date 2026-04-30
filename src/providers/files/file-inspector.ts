import { readFile } from "node:fs/promises";
import imageSize from "image-size";
import pdfParse from "pdf-parse-new";
import { ExternalServiceError, TimeoutError, ValidationError } from "../../shared/errors/app-error";
import type { ProcessingFileReference } from "../../modules/processing/processing.service";

export interface FileInspectorOptions {
  maxPdfPages: number;
  maxImageWidth: number;
  maxImageHeight: number;
}

export class FileInspector {
  constructor(private readonly options: FileInspectorOptions) {}

  async inspect(file: ProcessingFileReference): Promise<void> {
    if (file.mimeType === "application/pdf") {
      await this.inspectPdf(file);
      return;
    }

    if (file.mimeType.startsWith("image/")) {
      await this.inspectImage(file);
    }
  }

  private async inspectPdf(file: ProcessingFileReference): Promise<void> {
    try {
      const fileBuffer = await readFile(file.path);
      const result = await withTimeout(
        pdfParse(fileBuffer, {
          max: 1,
          verbosityLevel: 0,
        }),
        10000,
      );
      const pages = result.numpages;

      if (!Number.isInteger(pages) || pages < 1) {
        throw new ValidationError("Could not determine PDF page count.", "INVALID_PDF_METADATA");
      }

      if (pages > this.options.maxPdfPages) {
        throw new ValidationError(
          `PDF exceeds the maximum page limit of ${this.options.maxPdfPages}.`,
          "PDF_PAGE_LIMIT_EXCEEDED",
        );
      }
    } catch (error) {
      console.error("FileInspector PDF inspection failed", {
        filePath: file.path,
        mimeType: file.mimeType,
        originalName: file.originalName,
        error,
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      if (isTimeoutError(error)) {
        throw new TimeoutError("PDF metadata inspection timed out.", "PDF_INFO_TIMEOUT");
      }

      throw new ExternalServiceError(
        "PDF metadata inspection failed.",
        "PDF_INFO_FAILED",
      );
    }
  }

  private async inspectImage(file: ProcessingFileReference): Promise<void> {
    const buffer = await readFile(file.path);
    const metadata = imageSize(buffer);

    if (!metadata.width || !metadata.height) {
      throw new ValidationError("Could not determine image dimensions.", "INVALID_IMAGE_METADATA");
    }

    if (
      metadata.width > this.options.maxImageWidth ||
      metadata.height > this.options.maxImageHeight
    ) {
      throw new ValidationError(
        `Image exceeds the maximum resolution of ${this.options.maxImageWidth}x${this.options.maxImageHeight}.`,
        "IMAGE_RESOLUTION_LIMIT_EXCEEDED",
      );
    }
  }
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof PdfInspectionTimeoutError;
}

class PdfInspectionTimeoutError extends Error {
  constructor() {
    super("PDF metadata inspection timed out.");
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new PdfInspectionTimeoutError());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
