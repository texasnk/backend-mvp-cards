import type { DatabaseClient, QueryResultRow } from "../../shared/db/database.types";
import type {
  CompleteProcessingRequestInput,
  CreateProcessingRequestInput,
  FailProcessingRequestInput,
  ProcessingInputType,
  ProcessingRequest,
  ProcessingStatus,
} from "./processing.types";

interface ProcessingRequestRow extends QueryResultRow {
  id: string;
  input_type: ProcessingInputType;
  provided_domain_id: string | null;
  resolved_domain_id: string | null;
  status: ProcessingStatus;
  cards_requested: number;
  cards_created: number;
  cards_persisted: number;
  suggested_domain_name: string | null;
  extracted_text_chars: number;
  failure_code: string | null;
  failure_reason: string | null;
  started_at: Date | string;
  finished_at: Date | string | null;
}

export class ProcessingRequestRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createStarted(input: CreateProcessingRequestInput): Promise<ProcessingRequest> {
    const result = await this.db.query<ProcessingRequestRow>(
      `
        insert into processing_requests (
          id,
          input_type,
          provided_domain_id,
          status,
          cards_requested,
          cards_created,
          cards_persisted,
          extracted_text_chars,
          started_at
        ) values ($1, $2, $3, 'started', $4, 0, 0, 0, now())
        returning
          id,
          input_type,
          provided_domain_id,
          resolved_domain_id,
          status,
          cards_requested,
          cards_created,
          cards_persisted,
          suggested_domain_name,
          extracted_text_chars,
          failure_code,
          failure_reason,
          started_at,
          finished_at
      `,
      [input.id, input.inputType, input.providedDomainId ?? null, input.cardsRequested],
    );

    return mapProcessingRequestRow(result.rows[0]);
  }

  async markSucceeded(input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null> {
    return this.updateCompletionState("succeeded", input);
  }

  async markSucceededWithoutPersistence(
    input: CompleteProcessingRequestInput,
  ): Promise<ProcessingRequest | null> {
    return this.updateCompletionState("succeeded_without_persistence", input);
  }

  async markFailed(input: FailProcessingRequestInput): Promise<ProcessingRequest | null> {
    const result = await this.db.query<ProcessingRequestRow>(
      `
        update processing_requests
        set
          status = 'failed',
          extracted_text_chars = $2,
          failure_code = $3,
          failure_reason = $4,
          finished_at = now()
        where id = $1
        returning
          id,
          input_type,
          provided_domain_id,
          resolved_domain_id,
          status,
          cards_requested,
          cards_created,
          cards_persisted,
          suggested_domain_name,
          extracted_text_chars,
          failure_code,
          failure_reason,
          started_at,
          finished_at
      `,
      [input.id, input.extractedTextChars, input.failureCode, input.failureReason],
    );

    return result.rowCount === 0 ? null : mapProcessingRequestRow(result.rows[0]);
  }

  async findById(id: string): Promise<ProcessingRequest | null> {
    const result = await this.db.query<ProcessingRequestRow>(
      `
        select
          id,
          input_type,
          provided_domain_id,
          resolved_domain_id,
          status,
          cards_requested,
          cards_created,
          cards_persisted,
          suggested_domain_name,
          extracted_text_chars,
          failure_code,
          failure_reason,
          started_at,
          finished_at
        from processing_requests
        where id = $1
      `,
      [id],
    );

    return result.rowCount === 0 ? null : mapProcessingRequestRow(result.rows[0]);
  }

  private async updateCompletionState(
    status: "succeeded" | "succeeded_without_persistence",
    input: CompleteProcessingRequestInput,
  ): Promise<ProcessingRequest | null> {
    const result = await this.db.query<ProcessingRequestRow>(
      `
        update processing_requests
        set
          resolved_domain_id = $2,
          status = $3,
          cards_created = $4,
          cards_persisted = $5,
          suggested_domain_name = $6,
          extracted_text_chars = $7,
          finished_at = now()
        where id = $1
        returning
          id,
          input_type,
          provided_domain_id,
          resolved_domain_id,
          status,
          cards_requested,
          cards_created,
          cards_persisted,
          suggested_domain_name,
          extracted_text_chars,
          failure_code,
          failure_reason,
          started_at,
          finished_at
      `,
      [
        input.id,
        input.resolvedDomainId ?? null,
        status,
        input.cardsCreated,
        input.cardsPersisted,
        input.suggestedDomainName ?? null,
        input.extractedTextChars,
      ],
    );

    return result.rowCount === 0 ? null : mapProcessingRequestRow(result.rows[0]);
  }
}

function mapProcessingRequestRow(row: ProcessingRequestRow): ProcessingRequest {
  return {
    id: row.id,
    inputType: row.input_type,
    providedDomainId: row.provided_domain_id,
    resolvedDomainId: row.resolved_domain_id,
    status: row.status,
    cardsRequested: row.cards_requested,
    cardsCreated: row.cards_created,
    cardsPersisted: row.cards_persisted,
    suggestedDomainName: row.suggested_domain_name,
    extractedTextChars: row.extracted_text_chars,
    failureCode: row.failure_code,
    failureReason: row.failure_reason,
    startedAt: new Date(row.started_at),
    finishedAt: row.finished_at ? new Date(row.finished_at) : null,
  };
}

