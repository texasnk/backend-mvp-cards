# Validação Final do MVP

## Objetivo

Consolidar o estado atual da implementação do MVP, registrando:

- evidências de implementação já existentes;
- pendências que ainda impedem o aceite final integral;
- decisões técnicas assumidas durante a implementação;
- limites operacionais atualmente refletidos no código.

Este documento complementa:

- [USs.md](/backend-mvp-cards/docs/USs.md:1)
- [Arquitetura.md](/backend-mvp-cards/docs/Arquitetura.md:1)
- [Planejamento.md](/backend-mvp-cards/docs/Planejamento.md:1)
- [Checklist-Implementacao.md](/backend-mvp-cards/docs/Checklist-Implementacao.md:1)
- [Checklist-Final-Aceite.md](/backend-mvp-cards/docs/Checklist-Final-Aceite.md:1)

## Estado atual

### Implementado em código

- Modelagem e persistência de `study_domains`, `cards` e `processing_requests`.
- Regras de negócio para domínios, cards e fluxo principal de processamento.
- Rotas HTTP para domínios, cards, processamento, health e métricas.
- Suporte HTTP a `application/json` com `text` e `multipart/form-data` com `file`.
- Adaptadores de integração para OCR/visão, extração de PDF e geração/classificação via OpenAI.
- Middlewares de `requestId`, headers de segurança, CORS, upload, logging e rate limit.
- Registro local de métricas HTTP em memória.
- Cliente PostgreSQL, bootstrap real da aplicação e readiness por banco.
- Toolchain mínima do projeto com `package.json`, `tsconfig.json`, `jest.config.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example` e `LICENSE`.
- `npm run build` e `npm test` executados com sucesso em `2026-04-29`.

### Ainda pendente para aceite final integral

- Rodar `npm run db:migrate` contra PostgreSQL ativo.
- Validar o fluxo fim a fim de `/api/v1/processings` com credenciais OpenAI reais.
- Introduzir transação explícita para persistência dos cards gerados.
- Implementar testes de integração HTTP dos CRUDs e do endpoint de processamento.
- Implementar testes negativos de segurança e falha externa.

## Limites operacionais atuais

### Já refletidos no código

- `requestId` por header `X-Request-Id`.
- Cards com conteúdo mínimo validado em serviço, schema e retorno da IA.
- Persistência de cards gerados apenas quando houver domínio resolvido.
- Timeout no cliente OpenAI.
- Timeout na extração textual de PDF.
- Timeout na conversão de PDF para imagem.
- Upload limitado por tamanho e validado por MIME/extensão.
- PDF validado por quantidade de páginas.
- Imagem validada por resolução máxima.
- OCR e geração tratados como saída não confiável, com validação estrutural mínima.

### Ainda dependentes de validação operacional

- Execução das migrations em banco real.
- Execução do fluxo com OpenAI real e arquivos reais.
- Comportamento transacional do processamento em falhas intermediárias.
- Cobertura automatizada de integração e cenários negativos.

## Decisões técnicas registradas

| Decisão | Motivo | Impacto atual |
|---|---|---|
| `ContentProcessingService` recebe `domainMatchThreshold` por configuração | Evitar fixar limiar de aderência sem decisão final de produto | O fluxo está preparado e o valor pode ser ajustado por ambiente. |
| Adaptadores de PDF usam `pdf-parse-new` para extração e inspeção | Remove dependências nativas de inspeção e simplifica o ambiente local | PDFs sem camada de texto deixam de ter fallback OCR neste backend. |
| Métricas usam registro local em memória | Fechar observabilidade mínima sem ampliar dependências agora | Pode ser substituído por `prom-client` depois. |
| O endpoint de processamento aceita apenas uma origem por requisição | Garantir consistência entre `text` e `file` | A validação já está conectada no controller HTTP. |

## Matriz de rastreabilidade por user story

| User story | Estado | Evidência principal | Pendência crítica |
|---|---|---|---|
| `US-01` CRUD de domínios | Parcialmente implementada | `src/modules/domains/*`, `src/app/routes/api.routes.ts`, `npm test` | Faltam testes de integração HTTP e validação com banco real. |
| `US-02` CRUD de cards manuais | Parcialmente implementada | `src/modules/cards/*`, `src/app/routes/api.routes.ts`, `npm test` | Faltam testes de integração HTTP e validação com banco real. |
| `US-03` processamento com domínio opcional | Parcialmente implementada | `src/modules/processing/*`, `src/providers/*`, `src/app/bootstrap.ts` | Faltam transação explícita, validação com banco real e fluxo OpenAI real. |
| `US-04` classificação de domínio ou sugestão | Parcialmente implementada | `processing.service.ts`, `openai.generator.ts`, `prompt-builder.ts` | Falta execução real e fechamento de testes de integração/segurança. |

## Matriz de rastreabilidade por requisito funcional

| Requisito | Estado | Evidência | Observação |
|---|---|---|---|
| `RF-01` a `RF-05` | Parcial | `domain.repository.ts`, `domain.service.ts`, `domain.controller.ts`, `npm test` | Código e testes unitários existem; falta validação HTTP real. |
| `RF-06` a `RF-10` | Parcial | `card.repository.ts`, `card.service.ts`, `card.controller.ts`, `npm test` | Código e testes unitários existem; falta validação HTTP real. |
| `RF-11` a `RF-13` | Parcial | `pdf-text-extractor.ts`, `file-inspector.ts`, `openai.vision-ocr.ts`, `processing.controller.ts` | Upload, extração textual e OCR de imagem estão ligados; falta validação fim a fim. |
| `RF-14` | Implementado em código | `processing.schemas.ts`, `processing.controller.ts` | A origem única já é validada no endpoint. |
| `RF-15` a `RF-29` | Parcial | `processing.service.ts`, `openai.generator.ts`, `processing.repository.ts`, `src/app/bootstrap.ts` | Fluxo implementado; falta transação explícita e validação operacional. |
| `RF-30` e `RF-31` | Parcial | `processing.service.ts`, `openai.client.ts`, `pdf-text-extractor.ts`, `file-inspector.ts` | Timeouts já existem; falta validação em execução real. |
| `RF-32` a `RF-39` | Implementado em código | `package.json`, `tsconfig.json`, `jest.config.ts`, `docker-compose.yml`, `Dockerfile`, `README.md`, `LICENSE` | Falta validar migrations e compose em execução real. |

## Matriz de rastreabilidade por requisito não funcional

| Requisito | Estado | Evidência | Observação |
|---|---|---|---|
| `RNF-01` | Parcial | controllers, rotas e error handler | Contrato de erro existe, mas a taxonomia final ainda pode evoluir. |
| `RNF-02` | Parcial | `*.schemas.ts` | Validação mínima existente sem dependência extra. |
| `RNF-03` e `RNF-04` | Parcial | `request-id.middleware.ts`, `logger.ts`, `processing_requests` | Observabilidade básica implementada. |
| `RNF-05` | Pendente | sem TLS/app gateway no repositório | Depende da infraestrutura final. |
| `RNF-06` | Parcial | `processing.service.ts`, `processing.repository.ts` | Transação explícita ainda pendente. |
| `RNF-07` | Implementado em código | `processing.service.ts` | Fluxo síncrono modelado e conectado. |
| `RNF-08` e `RNF-09` | Parcial | `openai.client.ts`, `pdf-text-extractor.ts`, `file-inspector.ts` | Timeouts implementados nos adaptadores. |
| `RNF-10` a `RNF-12` | Parcial | `env.ts`, `upload.middleware.ts`, `file-inspector.ts` | Limites e validações existem; falta validação operacional. |
| `RNF-13` | Parcial | prompts e geração em PT-BR | Ainda sem validação real com OpenAI. |
| `RNF-14` | Implementado em código | código em inglês, docs em PT-BR | Aderência mantida. |
| `RNF-15` | Implementado em código | providers e serviços desacoplados | Bom nível de isolamento presente. |
| `RNF-16` | Parcial | `normalization.ts`, `processing.service.ts`, `openai.generator.ts` | Resolução automática está conectada; falta validação real. |
| `RNF-17` | Parcial | `http-error-handler.ts`, `AppError` | Tratamento seguro existe, mas ainda pode ser refinado. |
| `RNF-18` | Parcial | `package.json`, `tsconfig.json`, `docker-compose.yml`, `README.md` | Base técnica existe e build/test já rodaram; falta validação com banco real e compose em uso. |

## Riscos ainda ativos

| Risco | Situação atual | Próxima ação recomendada |
|---|---|---|
| Sem transação explícita no processamento | Alto | Encapsular persistência dos cards gerados em unidade transacional. |
| Fluxo OpenAI não validado em ambiente real | Alto | Executar testes manuais com chave e arquivos reais. |
| Migrations não validadas em PostgreSQL ativo | Alto | Subir banco local e rodar `npm run db:migrate`. |
| Sem testes de integração HTTP | Médio | Cobrir CRUDs e `/api/v1/processings` com `supertest`. |
| Sem testes negativos dedicados | Médio | Adicionar cenários de MIME inválido, arquivo excessivo e falhas externas. |

## Parecer atual

O repositório já contém a base técnica obrigatória, a documentação operacional mínima e uma implementação funcional coerente do MVP.

O aceite final ainda não pode ser marcado como concluído porque faltam validações contra infraestrutura real e um fechamento técnico importante no fluxo de persistência.

Conclusão objetiva:

- as pendências de configuração e documentação foram resolvidas;
- `build` e testes unitários já passaram;
- o aceite final do MVP permanece `EM ANDAMENTO` por falta de validação operacional e testes de integração.
