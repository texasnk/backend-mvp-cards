import { readFile } from "node:fs/promises";
import pdfParse from "pdf-parse-new";
import type {
  PdfTextExtractor,
  ProcessingFileReference,
} from "../../services/processing/processing.service";
import {
  ExternalServiceError,
  TimeoutError,
} from "../../shared/errors/app-error";

export interface LocalPdfTextExtractorOptions {
  timeoutMs: number;
}

export class LocalPdfTextExtractor implements PdfTextExtractor {
  constructor(private readonly options: LocalPdfTextExtractorOptions) {}

  async extractText(file: ProcessingFileReference): Promise<string> {
    try {
      const extractionResult = await withTimeout(
        (async () => {
          const fileBuffer = await readFile(file.path);
          return pdfParse(fileBuffer, { verbosityLevel: 0 });
        })(),
        this.options.timeoutMs,
      );

      return extractionResult.text;
    } catch (error: unknown) {
      if (isTimeoutError(error)) {
        throw new TimeoutError(
          "PDF text extraction timed out.",
          "PDF_TEXT_EXTRACTION_TIMEOUT",
        );
      }

      throw new ExternalServiceError(
        "PDF text extraction failed.",
        "PDF_TEXT_EXTRACTION_FAILED",
      );
    }
  }
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof PdfTextExtractionTimeoutError;
}

class PdfTextExtractionTimeoutError extends Error {
  constructor() {
    super("PDF text extraction timed out.");
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new PdfTextExtractionTimeoutError());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
