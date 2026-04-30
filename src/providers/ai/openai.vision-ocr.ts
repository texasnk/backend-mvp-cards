import { readFile } from "node:fs/promises";
import type {
  ProcessingFileReference,
  VisionOcrProvider,
} from "../../modules/processing/processing.service";
import { ExternalServiceError } from "../../shared/errors/app-error";
import { OpenAiClient } from "./openai.client";

export class OpenAiVisionOcrProvider implements VisionOcrProvider {
  constructor(private readonly client: OpenAiClient) {}

  async extractTextFromImage(file: ProcessingFileReference): Promise<string> {
    const fileBuffer = await readFile(file.path);
    const dataUrl = `data:${file.mimeType};base64,${fileBuffer.toString("base64")}`;

    const responseText = await this.client.createResponse({
      instructions: [
        "Extraia apenas o texto reconhecido da imagem.",
        "Nao explique o resultado.",
        "Responda apenas com o texto extraido em PT-BR quando aplicavel.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extraia o texto desta imagem.",
            },
            {
              type: "input_image",
              image_url: dataUrl,
            },
          ],
        },
      ],
    });

    if (responseText.trim().length === 0) {
      throw new ExternalServiceError("OpenAI OCR returned empty output.", "EMPTY_OCR_OUTPUT");
    }

    return responseText;
  }
}

