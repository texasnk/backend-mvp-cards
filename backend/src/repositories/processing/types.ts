import type { CompleteProcessingRequestInput, CreateProcessingRequestInput, FailProcessingRequestInput, ProcessingRequest } from "../../services/processing/types";

/** SPEC-ORM-02: Define as operações de persistência de processamentos. */
export interface IProcessingRequestRepository {
  createStarted(input: CreateProcessingRequestInput): Promise<ProcessingRequest>;
  markSucceeded(input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null>;
  markSucceededWithoutPersistence(input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null>;
  markFailed(input: FailProcessingRequestInput): Promise<ProcessingRequest | null>;
  findById(id: string): Promise<ProcessingRequest | null>;
}
