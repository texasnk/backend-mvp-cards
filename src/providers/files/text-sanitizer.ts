import type { TextSanitizer } from "../../modules/processing/processing.service";

const MULTIPLE_WHITESPACE_PATTERN = /\s+/g;

export class DefaultTextSanitizer implements TextSanitizer {
  sanitizeText(text: string): string {
    return text
      .replace(/\u0000/g, " ")
      .replace(MULTIPLE_WHITESPACE_PATTERN, " ")
      .trim();
  }
}

