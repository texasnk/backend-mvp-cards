import { extname } from "node:path";
import { ValidationError } from "../../shared/errors/app-error";

const ALLOWED_MIME_TYPES = new Map<string, string[]>([
  ["application/pdf", [".pdf"]],
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/webp", [".webp"]],
]);

export interface MimeValidationOptions {
  allowedMimeTypes?: Map<string, string[]>;
}

export class MimeValidator {
  private readonly allowedMimeTypes: Map<string, string[]>;

  constructor(options?: MimeValidationOptions) {
    this.allowedMimeTypes = options?.allowedMimeTypes ?? ALLOWED_MIME_TYPES;
  }

  validate(mimeType: string, originalName: string): void {
    const allowedExtensions = this.allowedMimeTypes.get(mimeType);

    if (!allowedExtensions) {
      throw new ValidationError("Unsupported file MIME type.", "UNSUPPORTED_MIME_TYPE");
    }

    const fileExtension = extname(originalName).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new ValidationError(
        "File extension does not match the declared MIME type.",
        "MIME_EXTENSION_MISMATCH",
      );
    }
  }
}

