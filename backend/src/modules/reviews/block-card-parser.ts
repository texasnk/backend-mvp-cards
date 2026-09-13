import { ValidationError } from "../../shared/errors/app-error";

export interface CardDraft {
  front: string;
  back: string;
}
/** SPEC-IMP-03: Converte linhas pergunta;resposta ou pergunta<TAB>resposta em cards. */
export function parseCardBlock(text: string): CardDraft[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length)
    throw new ValidationError(
      "The text block must contain at least one card.",
      "INVALID_CARD_BLOCK",
    );
  return lines.map((line, index) => {
    const separators = [...line.matchAll(/[;\t]/g)];
    if (separators.length !== 1)
      throw new ValidationError(
        `Line ${index + 1} must contain exactly one semicolon or tab separator.`,
        "INVALID_CARD_BLOCK_LINE",
      );
    const position = separators[0].index as number;
    const front = line.slice(0, position).trim();
    const back = line.slice(position + 1).trim();
    if (front.length < 3 || back.length < 1)
      throw new ValidationError(
        `Line ${index + 1} must have a question with at least 3 characters and an answer with at least 1 character.`,
        "INVALID_CARD_BLOCK_LINE",
      );
    return { front, back };
  });
}
