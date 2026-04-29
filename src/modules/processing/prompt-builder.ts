import type { StudyDomain } from "../domains/domain.types";

export class ProcessingPromptBuilder {
  buildClassificationInstructions(): string {
    return [
      "Responda em JSON valido.",
      "Considere apenas os dominios existentes enviados na entrada.",
      "Nao invente dominio fora da lista.",
      "Retorne domainId como null quando nao houver aderencia suficiente.",
      "Retorne confidence entre 0 e 1.",
    ].join(" ");
  }

  buildSuggestionInstructions(): string {
    return [
      "Responda em JSON valido.",
      "Sugira um nome de dominio curto em PT-BR com 3 a 40 caracteres.",
      "Nao explique a resposta.",
    ].join(" ");
  }

  buildMaterialInstructions(cardsCount: number): string {
    return [
      "Responda em JSON valido.",
      "Gere todo o conteudo em PT-BR.",
      "Nao invente informacoes fora do texto fornecido.",
      `Gere exatamente ${cardsCount} cards.`,
      "Use apenas as abordagens permitidas: definicao, comparacao, causa_efeito, aplicacao_pratica, armadilha_conceitual, verdadeiro_falso.",
    ].join(" ");
  }

  buildClassificationInput(text: string, domains: StudyDomain[]): unknown {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              text,
              domains: domains.map((domain) => ({
                id: domain.id,
                name: domain.name,
              })),
            }),
          },
        ],
      },
    ];
  }

  buildSuggestionInput(text: string): unknown {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({ text }),
          },
        ],
      },
    ];
  }

  buildMaterialInput(text: string, cardsCount: number): unknown {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              language: "pt-BR",
              cardsCount,
              text,
            }),
          },
        ],
      },
    ];
  }
}

