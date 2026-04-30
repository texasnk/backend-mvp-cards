# Checklist de Implementação

## Como preencher

- Marque `Status` com `TODO`, `EM ANDAMENTO`, `BLOQUEADO` ou `CONCLUÍDO`.
- Preencha `Responsável`, `Data` e `Observações` conforme a execução avançar.
- Use `Evidência` para apontar arquivo, PR, teste ou decisão que comprove a conclusão.
- Siga a ordem proposta, salvo bloqueio ou decisão técnica documentada.

## Resumo de acompanhamento

| Ordem | Etapa | Status | Responsável | Data | Observações |
|---|---|---|---|---|---|
| 1 | Base técnica | CONCLUÍDO |  | 2026-04-29 | `package.json`, `tsconfig.json`, `jest.config.ts`, `docker-compose.yml`, `.env.example`, `README.md`, `LICENSE`, bootstrap e entrypoint implementados. |
| 2 | Domínio e persistência | CONCLUÍDO |  | 2026-04-29 | Entidades, migrations e repositórios iniciais implementados. |
| 3 | Regras de negócio | EM ANDAMENTO |  | 2026-04-29 | Fluxo principal, OCR, OpenAI e upload foram conectados; ainda falta transação explícita para persistência dos cards gerados. |
| 4 | APIs e contratos | EM ANDAMENTO |  | 2026-04-29 | Endpoints obrigatórios estão expostos, inclusive `multipart/form-data`; taxonomia final de erro e testes de integração ainda pendentes. |
| 5 | Segurança e observabilidade | EM ANDAMENTO |  | 2026-04-29 | Upload seguro, logging, CORS, rate limit e métricas HTTP estão ativos; métricas de processamento/OpenAI e testes negativos ainda faltam. |
| 6 | Testes e aceite | EM ANDAMENTO |  | 2026-04-29 | `build` e testes unitários passaram; ainda faltam migrations em banco real, testes HTTP e validação fim a fim com OpenAI. |

## Ordem de implementação detalhada

| Ordem | Fase | Item | Status | Responsável | Dependência | Evidência | Observações |
|---|---|---|---|---|---|---|---|
| 1 | Base técnica | Definir estrutura modular de pastas conforme a arquitetura | CONCLUÍDO |  | Nenhuma | `src/modules`, `src/shared`, `src/shared/db/migrations` | Estrutura mínima criada para suportar persistência e evolução posterior. |
| 2 | Base técnica | Definir contratos técnicos mínimos: entidades, enums, convenções de rota e nomenclatura | CONCLUÍDO |  | 1 | `src/modules/*/*.types.ts`, `src/shared/db/database.types.ts` | Contratos mínimos de entidades e banco criados e reutilizados nas camadas seguintes. |
| 3 | Base técnica | Configurar variáveis de ambiente com validação tipada | CONCLUÍDO |  | 1, 2 | `src/shared/config/env.ts`, `.env.example` | Ambiente validado com limites de upload, timeout, CORS, modelos OpenAI e banco. |
| 4 | Base técnica | Definir `package.json`, scripts do projeto, `tsconfig.json` e configuração de testes automatizados | CONCLUÍDO |  | 1, 2 | `package.json`, `tsconfig.json`, `jest.config.ts` | Scripts de `dev`, `build`, `start`, `test` e `db:migrate` presentes. |
| 5 | Base técnica | Configurar `docker-compose.yml` com `api` e `postgres` | CONCLUÍDO |  | 3, 4 | `docker-compose.yml`, `Dockerfile` | Compose sobe PostgreSQL local e imagem da API. |
| 6 | Base técnica | Criar artefatos operacionais mínimos: `.env.example`, `.gitignore`, `README.md` e `LICENSE` MIT | CONCLUÍDO |  | 3, 4, 5 | `.env.example`, `.gitignore`, `README.md`, `LICENSE` | Documentação operacional e licença adicionadas. |
| 7 | Domínio e persistência | Modelar `study_domain` com normalização e unicidade | CONCLUÍDO |  | 2 | `src/modules/domains/domain.types.ts`, `src/shared/utils/normalization.ts` | Regras de tamanho e normalização centralizadas. |
| 8 | Domínio e persistência | Modelar `card` com vínculo obrigatório a domínio e tipo de origem | CONCLUÍDO |  | 2, 7 | `src/modules/cards/card.types.ts` | `sourceType`, `approach`, `front` e `back` modelados com restrições mínimas. |
| 9 | Domínio e persistência | Modelar `processing_request` para rastreabilidade técnica | CONCLUÍDO |  | 2 | `src/modules/processing/processing.types.ts` | Modelo cobre status, domínio informado/resolvido, contadores e falha sanitizada. |
| 10 | Domínio e persistência | Criar migration de `study_domains` | CONCLUÍDO |  | 7 | `src/shared/db/migrations/001_create_study_domains.sql` | Inclui unicidade por `name_normalized` e checks de tamanho. |
| 11 | Domínio e persistência | Criar migration de `cards` com FK para `study_domains` | CONCLUÍDO |  | 8, 10 | `src/shared/db/migrations/002_create_cards.sql` | Inclui FK obrigatória, enum lógico e checks de conteúdo. |
| 12 | Domínio e persistência | Criar migration de `processing_requests` | CONCLUÍDO |  | 9, 10 | `src/shared/db/migrations/003_create_processing_requests.sql` | Inclui status, contadores e vínculos opcionais para domínio. |
| 13 | Domínio e persistência | Implementar repositório de domínios | CONCLUÍDO |  | 10 | `src/modules/domains/domain.repository.ts` | CRUD básico, busca por nome normalizado e listagem paginada. |
| 14 | Domínio e persistência | Implementar repositório de cards | CONCLUÍDO |  | 11 | `src/modules/cards/card.repository.ts` | CRUD, listagem paginada, filtros por domínio, origem e abordagem. |
| 15 | Domínio e persistência | Implementar repositório de processamento | CONCLUÍDO |  | 12 | `src/modules/processing/processing.repository.ts` | Suporta início, sucesso, sucesso sem persistência, falha e consulta. |
| 16 | Regras de negócio | Implementar `DomainService` com unicidade por nome normalizado | CONCLUÍDO |  | 13 | `src/modules/domains/domain.service.ts` | CRUD de serviço com validação de duplicidade e busca obrigatória por `id`. |
| 17 | Regras de negócio | Implementar `CardService` com validação de domínio existente | CONCLUÍDO |  | 14, 16 | `src/modules/cards/card.service.ts` | CRUD manual e persistência interna de cards gerados via mesma camada. |
| 18 | Regras de negócio | Definir DTOs e schemas de validação para domínios | CONCLUÍDO |  | 16 | `src/modules/domains/domain.schemas.ts` | Parsing e validação mínima de `body`, `params` e `query`. |
| 19 | Regras de negócio | Definir DTOs e schemas de validação para cards | CONCLUÍDO |  | 17 | `src/modules/cards/card.schemas.ts` | Parsing e validação mínima de `body`, `params` e `query`. |
| 20 | Regras de negócio | Implementar sanitização e limites de entrada para texto puro | CONCLUÍDO |  | 3, 18, 19 | `src/providers/files/text-sanitizer.ts`, `src/shared/config/env.ts` | Sanitização defensiva e limites configuráveis por ambiente. |
| 21 | Regras de negócio | Implementar extração textual de PDF pesquisável | CONCLUÍDO |  | 5 | `src/providers/files/pdf-text-extractor.ts` | Extração local via `pdf-parse-new` com timeout e tratamento de falha. |
| 22 | Regras de negócio | Implementar extração textual de PDF sem dependência nativa externa | CONCLUÍDO |  | 5, 21 | `src/providers/files/pdf-text-extractor.ts`, `src/providers/files/file-inspector.ts` | Extração e inspeção usam `pdf-parse-new` para texto e contagem de páginas. |
| 23 | Regras de negócio | Implementar OCR de imagem via OpenAI | CONCLUÍDO |  | 22 | `src/providers/ai/openai.vision-ocr.ts`, `src/providers/ai/openai.client.ts` | OCR multimodal implementado via cliente OpenAI com timeout. |
| 24 | Regras de negócio | Implementar adaptador OpenAI para classificação, sugestão, resumo e cards | CONCLUÍDO |  | 3 | `src/providers/ai/openai.generator.ts`, `src/modules/processing/prompt-builder.ts` | Adaptador com prompts, timeout, retry restrito e validação estrutural de retorno. |
| 25 | Regras de negócio | Implementar `ContentProcessingService` com fluxo síncrono, timeout e persistência condicional | EM ANDAMENTO |  | 15, 17, 20, 21, 23, 24 | `src/modules/processing/processing.service.ts`, `src/app/bootstrap.ts` | Fluxo completo e wiring implementados; ainda falta transação explícita para a persistência dos cards gerados. |
| 26 | APIs e contratos | Expor endpoints de CRUD de domínios | CONCLUÍDO |  | 16, 18 | `src/modules/domains/domain.controller.ts`, `src/app/routes/api.routes.ts` | Endpoints `POST/GET/PATCH/DELETE` expostos conforme a arquitetura. |
| 27 | APIs e contratos | Expor endpoints de CRUD de cards | CONCLUÍDO |  | 17, 19 | `src/modules/cards/card.controller.ts`, `src/app/routes/api.routes.ts` | Endpoints `POST/GET/PATCH/DELETE` expostos conforme a arquitetura. |
| 28 | APIs e contratos | Expor endpoint `POST /api/v1/processings` | CONCLUÍDO |  | 25 | `src/modules/processing/processing.controller.ts`, `src/app/routes/api.routes.ts`, `src/app/middlewares/upload.middleware.ts` | Endpoint suporta JSON com `text` e `multipart/form-data` com `file`. |
| 29 | APIs e contratos | Expor `health/live`, `health/ready` e `metrics` | CONCLUÍDO |  | 3, 12 | `src/app/routes/api.routes.ts`, `src/app/health/postgres-ready-check.ts`, `src/shared/telemetry/metrics.ts` | Liveness, readiness por PostgreSQL e métricas HTTP estão expostos. |
| 30 | APIs e contratos | Padronizar tratamento de erros, status codes e mensagens seguras | EM ANDAMENTO |  | 26, 27, 28 | `src/app/errors/http-error-handler.ts`, `src/shared/errors/app-error.ts` | Há tratamento HTTP mínimo por `AppError`; a taxonomia final ainda pode evoluir. |
| 31 | APIs e contratos | Implementar `requestId`, correlação e resposta padronizada | CONCLUÍDO |  | 26, 27, 28, 30 | `src/app/middlewares/request-id.middleware.ts`, `src/app/errors/http-error-handler.ts` | `requestId` é propagado por header e os erros já respondem em formato consistente. |
| 32 | Segurança e observabilidade | Implementar rate limiting e whitelisting de campos atualizáveis | CONCLUÍDO |  | 26, 27, 28, 31 | `src/app/middlewares/rate-limit.middleware.ts`, `src/modules/*/*.schemas.ts` | Rate limit básico por IP aplicado ao processamento; `PATCH` segue whitelist dos schemas. |
| 33 | Segurança e observabilidade | Implementar upload seguro com validação de MIME, extensão, tamanho, resolução e páginas | CONCLUÍDO |  | 21, 22, 28 | `src/providers/files/mime-validator.ts`, `src/providers/files/file-inspector.ts`, `src/app/middlewares/upload.middleware.ts` | Validação aplicada no endpoint HTTP com inspeção de PDF e imagem. |
| 34 | Segurança e observabilidade | Implementar proteção contra prompt injection indireta e validação da resposta da IA | EM ANDAMENTO |  | 23, 24, 25 | `src/modules/processing/prompt-builder.ts`, `src/providers/ai/openai.generator.ts`, `src/providers/files/text-sanitizer.ts` | Sanitização, prompts controlados e validação estrutural existem; faltam testes negativos dedicados. |
| 35 | Segurança e observabilidade | Implementar logs estruturados com sanitização e correlação por `requestId` | CONCLUÍDO |  | 30, 31 | `src/shared/logger/logger.ts`, `src/app/middlewares/request-logging.middleware.ts` | Logs JSON básicos com sanitização e correlação mínima implementados. |
| 36 | Segurança e observabilidade | Implementar métricas HTTP, de processamento e de chamadas OpenAI | EM ANDAMENTO |  | 24, 25, 29, 35 | `src/shared/telemetry/metrics.ts`, `src/app/routes/api.routes.ts` | Métricas HTTP já estão expostas; ainda faltam métricas específicas de processamento e OpenAI. |
| 37 | Testes e aceite | Implementar testes unitários de domínios, cards e validadores | EM ANDAMENTO |  | 16, 17, 18, 19 | `tests/domain.service.test.ts`, `tests/card.service.test.ts` | Testes unitários de serviços executados com sucesso; validadores e casos adicionais ainda faltam. |
| 38 | Testes e aceite | Implementar testes unitários de `ContentProcessingService` com mocks determinísticos | EM ANDAMENTO |  | 25 | `tests/processing.service.test.ts` | Teste base executado com sucesso; cenários adicionais ainda podem ser ampliados. |
| 39 | Testes e aceite | Implementar testes de integração dos CRUDs de domínios e cards | TODO |  | 26, 27, 37 |  |  |
| 40 | Testes e aceite | Implementar testes de integração do endpoint de processamento | TODO |  | 28, 32, 33, 38 |  |  |
| 41 | Testes e aceite | Implementar testes negativos de segurança e falha externa | TODO |  | 32, 33, 34, 40 |  |  |
| 42 | Testes e aceite | Consolidar documentação final, decisões pendentes e limites operacionais | CONCLUÍDO |  | 6, 29, 36, 41 | `README.md`, `docs/Validacao-Final.md`, `docs/Checklist-Final-Aceite.md` | Documentação operacional e de aceite consolidada. |
| 43 | Testes e aceite | Validar aceite final por user story, requisito e evidência de teste | EM ANDAMENTO |  | 39, 40, 41, 42 | `docs/Validacao-Final.md`, `docs/Checklist-Final-Aceite.md` | Ainda faltam validação com banco real, fluxo OpenAI real e testes HTTP. |

## Critérios de pronto

- `US-01` a `US-04` implementadas com evidência de teste.
- Endpoints obrigatórios disponíveis com contratos consistentes.
- Fluxo de processamento aceitando apenas uma origem por requisição.
- Persistência restrita a `study_domains`, `cards` e `processing_requests`.
- Resumo, texto bruto extraído e arquivo original não persistidos.
- Timeout e falha segura respeitados no limite de `30s`.
- Controles mínimos de segurança, logs e métricas ativos.
- Ambiente local executável com `docker compose`, `package.json`, `tsconfig.json`, configuração de testes e `LICENSE` MIT presentes no repositório.

## Decisões e bloqueios

| Tipo | Descrição | Impacto | Responsável | Status | Observações |
|---|---|---|---|---|---|
| Decisão | `ContentProcessingService` recebe `domainMatchThreshold` por configuração em vez de fixar um valor no código. | Evita cristalizar um limiar de aderência sem decisão final de produto. |  | REGISTRADO | O valor pode ser ajustado por ambiente. |
| Decisão | A extração textual e a inspeção de PDF usam `pdf-parse-new`. | Remove dependências nativas de inspeção e simplifica a execução local. |  | REGISTRADO | PDFs sem texto utilizável não entram em fallback OCR no backend atual. |
| Decisão | As métricas foram implementadas inicialmente em registro local em memória, com saída texto estilo Prometheus. | Permite fechar observabilidade básica sem ampliar a dependência externa do projeto neste momento. |  | REGISTRADO | Pode ser substituído por `prom-client` depois. |
| Bloqueio | A persistência dos cards gerados ainda não está encapsulada em transação explícita. | Mantém risco de inconsistência parcial em falhas entre gravações relacionadas. |  | ABERTO | É a principal pendência técnica restante no núcleo de processamento. |
| Bloqueio | Ainda não houve validação real de migrations e do fluxo `/api/v1/processings` contra PostgreSQL ativo e chave OpenAI válida. | Impede considerar o aceite final como concluído. |  | ABERTO | O repositório já possui a base técnica para essa validação. |
