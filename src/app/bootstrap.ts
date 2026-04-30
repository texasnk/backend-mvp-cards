import { CardController } from "../modules/cards/card.controller";
import { CardRepository } from "../modules/cards/card.repository";
import { CardService } from "../modules/cards/card.service";
import { DomainController } from "../modules/domains/domain.controller";
import { DomainRepository } from "../modules/domains/domain.repository";
import { DomainService } from "../modules/domains/domain.service";
import { ProcessingController } from "../modules/processing/processing.controller";
import { ContentProcessingService } from "../modules/processing/processing.service";
import { ProcessingRequestRepository } from "../modules/processing/processing.repository";
import { ProcessingPromptBuilder } from "../modules/processing/prompt-builder";
import { OpenAiClient } from "../providers/ai/openai.client";
import { OpenAiGeneratorProvider } from "../providers/ai/openai.generator";
import { OpenAiVisionOcrProvider } from "../providers/ai/openai.vision-ocr";
import { FileInspector } from "../providers/files/file-inspector";
import { MimeValidator } from "../providers/files/mime-validator";
import { LocalPdfTextExtractor } from "../providers/files/pdf-text-extractor";
import { TempFileManager } from "../providers/files/temp-file-manager";
import { DefaultTextSanitizer } from "../providers/files/text-sanitizer";
import { loadEnvironmentConfig } from "../shared/config/env";
import { PostgresConnectionManager } from "../shared/db/postgres.client";
import { JsonLogger } from "../shared/logger/logger";
import { InMemoryMetricsRegistry } from "../shared/telemetry/metrics";
import { UuidGenerator } from "../shared/utils/id-generator";
import { PostgresReadinessCheck } from "./health/postgres-ready-check";
import type { CreateAppDependencies } from "./app";
import type { ApiControllers } from "./routes/api.routes";

export interface BootstrapResult {
  controllers: ApiControllers;
  appDependencies: CreateAppDependencies;
  infrastructure: {
    connectionManager: PostgresConnectionManager;
    fileInspector: FileInspector;
    mimeValidator: MimeValidator;
    tempFileManager: TempFileManager;
  };
}

export function bootstrapApplication(): BootstrapResult {
  const config = loadEnvironmentConfig();
  const connectionManager = new PostgresConnectionManager(config.databaseUrl);
  const db = connectionManager.getClient();
  const logger = new JsonLogger();
  const metrics = new InMemoryMetricsRegistry();
  const readinessCheck = new PostgresReadinessCheck(connectionManager);
  const tempFileManager = new TempFileManager();
  const mimeValidator = new MimeValidator();
  const fileInspector = new FileInspector({
    maxPdfPages: config.maxPdfPages,
    maxImageWidth: config.maxImageWidth,
    maxImageHeight: config.maxImageHeight,
  });

  const domainRepository = new DomainRepository(db);
  const cardRepository = new CardRepository(db);
  const processingRequestRepository = new ProcessingRequestRepository(db);

  const domainService = new DomainService(domainRepository);
  const cardService = new CardService(cardRepository, domainService);

  const promptBuilder = new ProcessingPromptBuilder();
  const openAiTextClient = new OpenAiClient({
    apiKey: config.openAiApiKey,
    model: config.openAiModelText,
    timeoutMs: config.requestTimeoutMs,
    maxRetries: 1,
  });
  const openAiVisionClient = new OpenAiClient({
    apiKey: config.openAiApiKey,
    model: config.openAiModelVision,
    timeoutMs: config.requestTimeoutMs,
    maxRetries: 1,
  });

  const processingService = new ContentProcessingService(
    processingRequestRepository,
    domainService,
    cardService,
    new DefaultTextSanitizer(),
    new LocalPdfTextExtractor({ timeoutMs: config.requestTimeoutMs }),
    new OpenAiVisionOcrProvider(openAiVisionClient),
    new OpenAiGeneratorProvider(openAiTextClient, promptBuilder),
    new UuidGenerator(),
    {
      defaultCardsCount: config.defaultCardsPerRequest,
      maxCardsCount: config.maxCardsPerRequest,
      minCardsCount: 1,
      maxTextLength: config.maxTextChars,
      minUsableTextLength: 5,
      domainMatchThreshold: config.domainMatchThreshold,
    },
  );

  const controllers: ApiControllers = {
    domainController: new DomainController(domainService),
    cardController: new CardController(cardService),
    processingController: new ProcessingController(
      processingService,
      mimeValidator,
      fileInspector,
      tempFileManager,
    ),
  };

  return {
    controllers,
    appDependencies: {
      config,
      logger,
      metrics,
      readinessCheck,
    },
    infrastructure: {
      connectionManager,
      fileInspector,
      mimeValidator,
      tempFileManager,
    },
  };
}
