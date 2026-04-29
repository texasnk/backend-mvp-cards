import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  PdfTextExtractor,
  ProcessingFileReference,
} from "../../modules/processing/processing.service";
import { ExternalServiceError, TimeoutError } from "../../shared/errors/app-error";

const execFileAsync = promisify(execFile);

export interface LocalPdfTextExtractorOptions {
  timeoutMs: number;
  binaryPath?: string;
}

export class LocalPdfTextExtractor implements PdfTextExtractor {
  private readonly binaryPath: string;

  constructor(private readonly options: LocalPdfTextExtractorOptions) {
    this.binaryPath = options.binaryPath ?? "pdftotext";
  }

  async extractText(file: ProcessingFileReference): Promise<string> {
    try {
      const { stdout } = await execFileAsync(
        this.binaryPath,
        ["-layout", "-nopgbrk", file.path, "-"],
        {
          timeout: this.options.timeoutMs,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      return stdout;
    } catch (error: unknown) {
      if (isTimeoutError(error)) {
        throw new TimeoutError("PDF text extraction timed out.", "PDF_TEXT_EXTRACTION_TIMEOUT");
      }

      throw new ExternalServiceError(
        "PDF text extraction failed.",
        "PDF_TEXT_EXTRACTION_FAILED",
      );
    }
  }
}

function isTimeoutError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "killed" in error;
}

