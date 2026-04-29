import { ExternalServiceError, TimeoutError } from "../../shared/errors/app-error";

export interface OpenAiClientOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  baseUrl?: string;
}

export interface OpenAiResponseRequest {
  input: unknown;
  instructions?: string;
  responseFormat?: {
    type: "json_schema";
    name: string;
    schema: Record<string, unknown>;
  };
}

export class OpenAiClient {
  private readonly baseUrl: string;

  constructor(private readonly options: OpenAiClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
  }

  async createResponse(request: OpenAiResponseRequest): Promise<string> {
    let attempt = 0;

    while (true) {
      try {
        return await this.performRequest(request);
      } catch (error) {
        if (!isRetriable(error) || attempt >= this.options.maxRetries) {
          throw error;
        }

        attempt += 1;
      }
    }
  }

  private async performRequest(request: OpenAiResponseRequest): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          instructions: request.instructions,
          input: request.input,
          text: request.responseFormat
            ? {
                format: {
                  type: "json_schema",
                  name: request.responseFormat.name,
                  schema: request.responseFormat.schema,
                },
              }
            : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ExternalServiceError(
          `OpenAI request failed with status ${response.status}.`,
          "OPENAI_HTTP_ERROR",
        );
      }

      const data = (await response.json()) as Record<string, unknown>;
      const outputText = extractOutputText(data);

      if (!outputText) {
        throw new ExternalServiceError(
          "OpenAI response did not include textual output.",
          "OPENAI_EMPTY_OUTPUT",
        );
      }

      return outputText;
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError("OpenAI request timed out.", "OPENAI_TIMEOUT");
      }

      throw new ExternalServiceError("OpenAI request failed.", "OPENAI_REQUEST_FAILED");
    } finally {
      clearTimeout(timeout);
    }
  }
}

function extractOutputText(data: Record<string, unknown>): string | null {
  const directOutput = data.output_text;

  if (typeof directOutput === "string" && directOutput.trim().length > 0) {
    return directOutput;
  }

  const output = data.output;

  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const entry of content) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const text = (entry as { text?: unknown }).text;

      if (typeof text === "string" && text.trim().length > 0) {
        return text;
      }
    }
  }

  return null;
}

function isRetriable(error: unknown): boolean {
  return error instanceof TimeoutError;
}

