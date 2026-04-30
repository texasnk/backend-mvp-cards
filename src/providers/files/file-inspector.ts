import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import imageSize from "image-size";
import { ValidationError } from "../../shared/errors/app-error";
import type { ProcessingFileReference } from "../../modules/processing/processing.service";

const execFileAsync = promisify(execFile);

export interface FileInspectorOptions {
  maxPdfPages: number;
  maxImageWidth: number;
  maxImageHeight: number;
  pdfInfoBinaryPath?: string;
}

export class FileInspector {
  private readonly pdfInfoBinaryPath: string;

  constructor(private readonly options: FileInspectorOptions) {
    this.pdfInfoBinaryPath = options.pdfInfoBinaryPath ?? "pdfinfo";
  }

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
    const { stdout } = await execFileAsync(this.pdfInfoBinaryPath, [file.path], {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });
    const pagesMatch = stdout.match(/^Pages:\s+(\d+)/m);
    const pages = pagesMatch ? Number(pagesMatch[1]) : 0;

    if (!Number.isInteger(pages) || pages < 1) {
      throw new ValidationError("Could not determine PDF page count.", "INVALID_PDF_METADATA");
    }

    if (pages > this.options.maxPdfPages) {
      throw new ValidationError(
        `PDF exceeds the maximum page limit of ${this.options.maxPdfPages}.`,
        "PDF_PAGE_LIMIT_EXCEEDED",
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

