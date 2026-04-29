import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import type {
  PdfToImageConverter,
  ProcessingFileReference,
} from "../../modules/processing/processing.service";
import { ExternalServiceError, TimeoutError } from "../../shared/errors/app-error";
import { TempFileManager } from "./temp-file-manager";

const execFileAsync = promisify(execFile);

export interface PopplerPdfToImageConverterOptions {
  timeoutMs: number;
  binaryPath?: string;
}

export class PopplerPdfToImageConverter implements PdfToImageConverter {
  private readonly binaryPath: string;

  constructor(
    private readonly tempFileManager: TempFileManager,
    private readonly options: PopplerPdfToImageConverterOptions,
  ) {
    this.binaryPath = options.binaryPath ?? "pdftoppm";
  }

  async convertFirstPage(file: ProcessingFileReference): Promise<ProcessingFileReference> {
    const tempDirectory = await this.tempFileManager.createTempDirectory("pdf-image-");
    const outputPrefix = join(tempDirectory, basename(file.originalName, ".pdf"));

    try {
      await execFileAsync(
        this.binaryPath,
        ["-f", "1", "-singlefile", "-png", file.path, outputPrefix],
        {
          timeout: this.options.timeoutMs,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      const generatedFiles = await readdir(tempDirectory);
      const imageFileName = generatedFiles.find((entry) => entry.endsWith(".png"));

      if (!imageFileName) {
        throw new ExternalServiceError(
          "PDF to image conversion did not produce an output image.",
          "PDF_IMAGE_NOT_GENERATED",
        );
      }

      return {
        path: join(tempDirectory, imageFileName),
        mimeType: "image/png",
        originalName: imageFileName,
      };
    } catch (error: unknown) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }

      if (isTimeoutError(error)) {
        throw new TimeoutError("PDF to image conversion timed out.", "PDF_TO_IMAGE_TIMEOUT");
      }

      throw new ExternalServiceError(
        "PDF to image conversion failed.",
        "PDF_TO_IMAGE_FAILED",
      );
    }
  }
}

function isTimeoutError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "killed" in error;
}

