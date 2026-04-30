import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";
import { FileInspector } from "../../providers/files/file-inspector";
import { MimeValidator } from "../../providers/files/mime-validator";
import { TempFileManager } from "../../providers/files/temp-file-manager";
import { ContentProcessingService } from "./processing.service";
import { parseCreateProcessingBody } from "./processing.schemas";

export class ProcessingController {
  constructor(
    private readonly processingService: ContentProcessingService,
    private readonly mimeValidator: MimeValidator,
    private readonly fileInspector: FileInspector,
    private readonly tempFileManager: TempFileManager,
  ) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseCreateProcessingBody(request.body);
    const uploadedFile = request.file;
    const hasText = Boolean(body.text);
    const hasFile = Boolean(uploadedFile);

    if ((hasText && hasFile) || (!hasText && !hasFile)) {
      throw new ValidationError(
        "Exactly one content origin must be provided: text or file.",
        "INVALID_PROCESSING_REQUEST",
      );
    }

    try {
      const requestId = body.requestId ?? request.requestId ?? randomUUID();

      if (hasText) {
        if (body.inputType && body.inputType !== "text") {
          throw new ValidationError(
            'Field "inputType" must be "text" when using textual content.',
            "INVALID_PROCESSING_REQUEST",
          );
        }

        const result = await this.processingService.process({
          requestId,
          inputType: "text",
          text: body.text as string,
          domainId: body.domainId,
          cardsCount: body.cardsCount,
        });

        response.status(200).json(result);
        return;
      }

      const fileReference = {
        path: uploadedFile!.path,
        mimeType: uploadedFile!.mimetype,
        originalName: uploadedFile!.originalname,
      };

      this.mimeValidator.validate(fileReference.mimeType, fileReference.originalName);
      await this.fileInspector.inspect(fileReference);

      const inputType = fileReference.mimeType === "application/pdf" ? "pdf" : "image";

      if (body.inputType && body.inputType !== inputType) {
        throw new ValidationError(
          `Field "inputType" does not match uploaded file type "${inputType}".`,
          "INVALID_PROCESSING_REQUEST",
        );
      }

      const result = await this.processingService.process({
        requestId,
        inputType,
        file: fileReference,
        domainId: body.domainId,
        cardsCount: body.cardsCount,
      });

      response.status(200).json(result);
    } finally {
      if (uploadedFile?.path) {
        await this.tempFileManager.cleanup(uploadedFile.path);
      }
    }
  };
}
