# SPEC-REVISAO-E-IMPORTACAO

## RF-IMP-01 — Importação em bloco

O endpoint recebe `studyDomainId` e `text`. Cada linha não vazia deve conter exatamente um separador: `;` ou tabulação. O trecho à esquerda é a pergunta e o da direita é a resposta. Qualquer outra forma é inválida e a operação inteira é rejeitada.

## RF-REV-01 — Estados e opções

Todo card inicia em `new`. As respostas aceitas são `again`, `hard`, `good` e `easy`. O ciclo é `new → learning → review`; `again` em `review` conduz a `relearn`.

## RF-REV-02 — SM-2 inicial

São usados passos de 1 e 10 minutos. Cards aprovados concluem em um dia; Easy conclui em quatro dias. Em revisão, Hard multiplica o intervalo por 1,2, Good pelo fator de facilidade e Easy pelo fator e 1,3. Again reinicia o reaprendizado em um minuto. O fator começa em 2,5 e nunca fica abaixo de 1,3.

## ADR-001 — SM-2 antes de FSRS

Decisão: usar SM-2 determinístico nesta fase. Motivo: FSRS requer parâmetros otimizados a partir de histórico suficiente, que ainda não existe. Consequência: as regras são estáveis e testáveis; a futura adoção de FSRS exige novo ADR e migração do cálculo.

## ADR-002 — Prisma nos novos repositórios

Decisão: persistência do histórico de revisão é feita por Prisma. A migração completa dos repositórios legados será tratada em ADR próprio para evitar alterar simultaneamente todos os fluxos já publicados.
