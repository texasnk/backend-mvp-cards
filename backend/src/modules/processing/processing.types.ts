export const PROCESSING_INPUT_TYPES = ["text", "image", "pdf"] as const;
export type ProcessingInputType = (typeof PROCESSING_INPUT_TYPES)[number];

export const PROCESSING_STATUSES = [
  "started",
  "succeeded",
  "failed",
  "succeeded_without_persistence",
] as const;
export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export interface ProcessingRequest {
  id: string;
  inputType: ProcessingInputType;
  providedDomainId: string | null;
  resolvedDomainId: string | null;
  status: ProcessingStatus;
  cardsRequested: number;
  cardsCreated: number;
  cardsPersisted: number;
  suggestedDomainName: string | null;
  extractedTextChars: number;
  failureCode: string | null;
  failureReason: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

export interface CreateProcessingRequestInput {
  id: string;
  inputType: ProcessingInputType;
  providedDomainId?: string | null;
  cardsRequested: number;
}

export interface CompleteProcessingRequestInput {
  id: string;
  resolvedDomainId?: string | null;
  cardsCreated: number;
  cardsPersisted: number;
  suggestedDomainName?: string | null;
  extractedTextChars: number;
}

export interface FailProcessingRequestInput {
  id: string;
  failureCode: string;
  failureReason: string;
  extractedTextChars: number;
}

