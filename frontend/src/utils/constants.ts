import type { TCardApproach } from "../services/card/types";
export const approaches: { value: TCardApproach; label: string }[] = [
  { value: "definicao", label: "Definição" },
  { value: "comparacao", label: "Comparação" },
  { value: "causa_efeito", label: "Causa e efeito" },
  { value: "aplicacao_pratica", label: "Aplicação prática" },
  { value: "armadilha_conceitual", label: "Armadilha conceitual" },
  { value: "verdadeiro_falso", label: "Verdadeiro ou falso" },
];
