import type { TCardApproach } from "../card/types";
export interface IProcessingInput {
  text?: string;
  file?: File;
  domainId?: string;
  cardsCount: number;
}
export interface IProcessingCard {
  id: string | null;
  front: string;
  back: string;
  approach: TCardApproach | null;
}
export interface IProcessingResult {
  requestId: string;
  inputType: "text" | "image" | "pdf";
  summary: string;
  domain: { mode: "provided" | "classified"; id: string; name: string } | null;
  suggestedDomain: { name: string } | null;
  cards: IProcessingCard[];
}
