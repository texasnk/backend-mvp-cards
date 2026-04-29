# Checklist de Implementação

## Como preencher

- Marque `Status` com `TODO`, `EM ANDAMENTO`, `BLOQUEADO` ou `CONCLUÍDO`.
- Preencha `Responsável`, `Data` e `Observações` conforme a execução avançar.
- Use `Evidência` para apontar arquivo, PR, teste ou decisão que comprove a conclusão.
- Siga a ordem proposta, salvo bloqueio ou decisão técnica documentada.

## Resumo de acompanhamento

| Ordem | Etapa | Status | Responsável | Data | Observações |
|---|---|---|---|---|---|
| 1 | Base técnica | EM ANDAMENTO |  | 2026-04-29 | Estrutura modular, contratos mínimos e base de persistência criados; ainda faltam `package.json`, `tsconfig.json`, configuração de testes, `docker-compose.yml`, `.env.example`, `README.md` e `LICENSE`. |
| 2 | Domínio e persistência | CONCLUÍDO |  | 2026-04-29 | Entidades, migrations e repositórios iniciais implementados. |
| 3 | Regras de negócio | EM ANDAMENTO |  | 2026-04-29 | `DomainService`, `CardService` e a base de `ContentProcessingService` foram implementados com interfaces abstratas; adaptadores concretos e DTOs ainda pendentes. |
| 4 | APIs e contratos | EM ANDAMENTO |  | 2026-04-29 | Controllers, rotas e `app` mínimo foram implementados; processamento HTTP ainda está limitado ao payload JSON com `text` até a etapa de integrações de arquivo. |
| 5 | Segurança e observabilidade | TODO |  |  |  |
| 6 | Testes e aceite | TODO |  |  |  |

## Ordem de implementação detalhada

| Ordem | Fase | Item | Status | Responsável | Dependência | Evidência | Observações |
|---|---|---|---|---|---|---|---|
| 1 | Base técnica | Definir estrutura modular de pastas conforme a arquitetura | CONCLUÍDO |  | Nenhuma | `src/modules`, `src/shared`, `src/shared/db/migrations` | Estrutura mínima criada para suportar persistência e evolução posterior. |
| 2 | Base técnica | Definir contratos técnicos mínimos: entidades, enums, convenções de rota e nomenclatura | CONCLUÍDO |  | 1 | `src/modules/*/*.types.ts`, `src/shared/db/database.types.ts` | Contratos mínimos de entidades e banco criados; convenções de rota ainda serão usadas nas próximas etapas. |
| 3 | Base técnica | Configurar variáveis de ambiente com validação tipada | TODO |  | 1, 2 |  |  |
| 4 | Base técnica | Definir `package.json`, scripts do projeto, `tsconfig.json` e configuração de testes automatizados | TODO |  | 1, 2 |  | Deve incluir scripts mínimos de `dev`, `build`, `test` e `start`. |
| 5 | Base técnica | Configurar `docker-compose.yml` com `api` e `postgres` | TODO |  | 3, 4 |  | O compose deve subir pelo menos o banco PostgreSQL localmente; a API no compose é a opção preferida do MVP. |
| 6 | Base técnica | Criar artefatos operacionais mínimos: `.env.example`, `.gitignore`, `README.md` e `LICENSE` MIT | TODO |  | 3, 4, 5 |  |  |
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
| 18 | Regras de negócio | Definir DTOs e schemas de validação para domínios | CONCLUÍDO |  | 16 | `src/modules/domains/domain.schemas.ts` | Parsing e validação mínima de `body`, `params` e `query` implementados sem dependência externa nesta etapa. |
| 19 | Regras de negócio | Definir DTOs e schemas de validação para cards | CONCLUÍDO |  | 17 | `src/modules/cards/card.schemas.ts` | Parsing e validação mínima de `body`, `params` e `query` implementados sem dependência externa nesta etapa. |
| 20 | Regras de negócio | Implementar sanitização e limites de entrada para texto puro | CONCLUÍDO |  | 3, 18, 19 | `src/providers/files/text-sanitizer.ts` | Sanitização defensiva de texto implementada; limites finais dependem da configuração tipada da etapa 1. |
| 21 | Regras de negócio | Implementar extração textual de PDF pesquisável | CONCLUÍDO |  | 5 | `src/providers/files/pdf-text-extractor.ts` | Extração local via `pdftotext` com timeout e tratamento de falha. |
| 22 | Regras de negócio | Implementar conversão de PDF escaneado para imagem | CONCLUÍDO |  | 5, 21 | `src/providers/files/pdf-to-image.ts`, `src/providers/files/temp-file-manager.ts` | Conversão da primeira página via `pdftoppm` com diretório temporário efêmero. |
| 23 | Regras de negócio | Implementar OCR de imagem e OCR de PDF escaneado via OpenAI | CONCLUÍDO |  | 22 | `src/providers/ai/openai.vision-ocr.ts`, `src/providers/ai/openai.client.ts` | OCR multimodal implementado via cliente OpenAI com timeout. |
| 24 | Regras de negócio | Implementar adaptador OpenAI para classificação, sugestão, resumo e cards | CONCLUÍDO |  | 3 | `src/providers/ai/openai.generator.ts`, `src/modules/processing/prompt-builder.ts`, `src/providers/ai/openai.client.ts` | Adaptador com prompts, timeout, retry restrito e validação estrutural mínima implementado. |
| 25 | Regras de negócio | Implementar `ContentProcessingService` com fluxo síncrono, timeout e persistência condicional | EM ANDAMENTO |  | 15, 17, 20, 21, 23, 24 | `src/modules/processing/processing.service.ts` | A orquestração central agora possui dependências concretas mapeadas; ainda falta wiring completo, upload multipart e transação real. |
| 26 | APIs e contratos | Expor endpoints de CRUD de domínios | CONCLUÍDO |  | 16, 18 | `src/modules/domains/domain.controller.ts`, `src/app/routes/api.routes.ts` | Endpoints `POST/GET/PATCH/DELETE` de domínios foram expostos conforme a arquitetura. |
| 27 | APIs e contratos | Expor endpoints de CRUD de cards | CONCLUÍDO |  | 17, 19 | `src/modules/cards/card.controller.ts`, `src/app/routes/api.routes.ts` | Endpoints `POST/GET/PATCH/DELETE` de cards foram expostos conforme a arquitetura. |
| 28 | APIs e contratos | Expor endpoint `POST /api/v1/processings` | EM ANDAMENTO |  | 25 | `src/modules/processing/processing.controller.ts`, `src/modules/processing/processing.schemas.ts` | Endpoint exposto para payload JSON com `text`; suporte a `multipart/form-data` depende das integrações e middlewares posteriores. |
| 29 | APIs e contratos | Expor `health/live`, `health/ready` e `metrics` | CONCLUÍDO |  | 3, 12 | `src/app/routes/api.routes.ts` | Endpoints mínimos expostos; `ready` e `metrics` ainda usam respostas placeholder até observabilidade e configuração real. |
| 30 | APIs e contratos | Padronizar tratamento de erros, status codes e mensagens seguras | EM ANDAMENTO |  | 26, 27, 28 | `src/app/errors/http-error-handler.ts` | Há tratamento HTTP mínimo para `AppError`; a taxonomia completa permanece pendente. |
| 31 | APIs e contratos | Implementar `requestId`, correlação e resposta padronizada | TODO |  | 26, 27, 28, 30 |  |  |
| 32 | Segurança e observabilidade | Implementar rate limiting e whitelisting de campos atualizáveis | TODO |  | 26, 27, 28, 31 |  |  |
| 33 | Segurança e observabilidade | Implementar upload seguro com validação de MIME, extensão, tamanho, resolução e páginas | TODO |  | 21, 22, 28 |  |  |
| 34 | Segurança e observabilidade | Implementar proteção contra prompt injection indireta e validação da resposta da IA | TODO |  | 23, 24, 25 |  |  |
| 35 | Segurança e observabilidade | Implementar logs estruturados com sanitização e correlação por `requestId` | TODO |  | 30, 31 |  |  |
| 36 | Segurança e observabilidade | Implementar métricas HTTP, de processamento e de chamadas OpenAI | TODO |  | 24, 25, 29, 35 |  |  |
| 37 | Testes e aceite | Implementar testes unitários de domínios, cards e validadores | TODO |  | 16, 17, 18, 19 |  |  |
| 38 | Testes e aceite | Implementar testes unitários de `ContentProcessingService` com mocks determinísticos | TODO |  | 25 |  |  |
| 39 | Testes e aceite | Implementar testes de integração dos CRUDs de domínios e cards | TODO |  | 26, 27, 37 |  |  |
| 40 | Testes e aceite | Implementar testes de integração do endpoint de processamento | TODO |  | 28, 32, 33, 38 |  |  |
| 41 | Testes e aceite | Implementar testes negativos de segurança e falha externa | TODO |  | 32, 33, 34, 40 |  |  |
| 42 | Testes e aceite | Consolidar documentação final, decisões pendentes e limites operacionais | TODO |  | 6, 29, 36, 41 |  |  |
| 43 | Testes e aceite | Validar aceite final por user story, requisito e evidência de teste | TODO |  | 39, 40, 41, 42 |  |  |

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
| Decisão | `ContentProcessingService` recebe `domainMatchThreshold` por configuração em vez de fixar um valor no código nesta etapa. | Evita cristalizar um limiar de aderência sem decisão final de produto. |  | REGISTRADO | O valor concreto deverá ser definido quando a configuração tipada e o adaptador OpenAI forem implementados. |
| Decisão | O endpoint de processamento HTTP foi limitado provisoriamente a JSON com `text`, mesmo já mantendo a rota final `/api/v1/processings`. | Evita simular suporte incompleto a upload antes da implementação real de `multipart`, OCR e validação de arquivo. |  | REGISTRADO | O suporte a `multipart/form-data` deve ser concluído junto das etapas de integração e segurança de upload. |
| Decisão | Os adaptadores de PDF dependem de binários do sistema (`pdftotext` e `pdftoppm`) em vez de biblioteca Node nesta etapa. | Mantém aderência ao documento arquitetural e reduz acoplamento prematuro a pacotes ainda não instalados. |  | REGISTRADO | A disponibilidade real desses binários será garantida quando `docker-compose.yml` e a imagem da API forem implementados. |
| Bloqueio |  |  |  | TODO |  |
