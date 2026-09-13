import { http } from "../http";
import type { IProcessingInput, IProcessingResult } from "./types";
export class ProcessingService {
  async create(input: IProcessingInput) {
    if (input.file) {
      const form = new FormData();
      form.append("file", input.file);
      form.append("cardsCount", String(input.cardsCount));
      if (input.domainId) form.append("domainId", input.domainId);
      return (await http.post<IProcessingResult>("/processings", form)).data;
    }
    return (
      await http.post<IProcessingResult>("/processings", {
        text: input.text,
        inputType: "text",
        domainId: input.domainId,
        cardsCount: input.cardsCount,
      })
    ).data;
  }
}
export const processingService = new ProcessingService();
