import type { PrismaClient, ProcessingRequest as PrismaProcessingRequest } from "@prisma/client";
import type { CompleteProcessingRequestInput, CreateProcessingRequestInput, FailProcessingRequestInput, ProcessingRequest, ProcessingStatus } from "../../services/processing/types";
import type { IProcessingRequestRepository } from "./types";

/** SPEC-ORM-01: Implementa a persistência de processamentos exclusivamente com Prisma. */
export class ProcessingRequestRepository implements IProcessingRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** SPEC-PROC-01: Registra o início de um processamento. */
  async createStarted(input: CreateProcessingRequestInput): Promise<ProcessingRequest> {
    return mapRequest(await this.prisma.processingRequest.create({
      data: { id: input.id, inputType: input.inputType, providedDomainId: input.providedDomainId ?? null, status: "started", cardsRequested: input.cardsRequested, startedAt: new Date() },
    }));
  }

  /** SPEC-PROC-02: Registra processamento concluído com persistência. */
  async markSucceeded(input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null> {
    return this.updateCompletion("succeeded", input);
  }

  /** SPEC-PROC-03: Registra processamento concluído sem persistência. */
  async markSucceededWithoutPersistence(input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null> {
    return this.updateCompletion("succeeded_without_persistence", input);
  }

  /** SPEC-PROC-04: Registra uma falha de processamento. */
  async markFailed(input: FailProcessingRequestInput): Promise<ProcessingRequest | null> {
    const result = await this.prisma.processingRequest.updateMany({
      where: { id: input.id },
      data: { status: "failed", extractedTextChars: input.extractedTextChars, failureCode: input.failureCode, failureReason: input.failureReason, finishedAt: new Date() },
    });
    return result.count ? this.findById(input.id) : null;
  }

  /** SPEC-PROC-05: Busca um processamento pelo identificador. */
  async findById(id: string): Promise<ProcessingRequest | null> {
    const request = await this.prisma.processingRequest.findUnique({ where: { id } });
    return request ? mapRequest(request) : null;
  }

  /** SPEC-PROC-06: Atualiza os dados finais de um processamento. */
  private async updateCompletion(status: Extract<ProcessingStatus, "succeeded" | "succeeded_without_persistence">, input: CompleteProcessingRequestInput): Promise<ProcessingRequest | null> {
    const result = await this.prisma.processingRequest.updateMany({
      where: { id: input.id },
      data: { resolvedDomainId: input.resolvedDomainId ?? null, status, cardsCreated: input.cardsCreated, cardsPersisted: input.cardsPersisted, suggestedDomainName: input.suggestedDomainName ?? null, extractedTextChars: input.extractedTextChars, finishedAt: new Date() },
    });
    return result.count ? this.findById(input.id) : null;
  }
}

/** SPEC-PROC-07: Converte o modelo Prisma no contrato de processamento. */
function mapRequest(request: PrismaProcessingRequest): ProcessingRequest {
  return { id: request.id, inputType: request.inputType as ProcessingRequest["inputType"], providedDomainId: request.providedDomainId, resolvedDomainId: request.resolvedDomainId, status: request.status as ProcessingStatus, cardsRequested: request.cardsRequested, cardsCreated: request.cardsCreated, cardsPersisted: request.cardsPersisted, suggestedDomainName: request.suggestedDomainName, extractedTextChars: request.extractedTextChars, failureCode: request.failureCode, failureReason: request.failureReason, startedAt: request.startedAt, finishedAt: request.finishedAt };
}
