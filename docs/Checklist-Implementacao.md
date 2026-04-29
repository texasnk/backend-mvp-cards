# Checklist de Implementação

## Como preencher

- Marque `Status` com `TODO`, `EM ANDAMENTO`, `BLOQUEADO` ou `CONCLUÍDO`.
- Preencha `Responsável`, `Data` e `Observações` conforme a execução avançar.
- Use `Evidência` para apontar arquivo, PR, teste ou decisão que comprove a conclusão.
- Siga a ordem proposta, salvo bloqueio ou decisão técnica documentada.

## Resumo de acompanhamento

| Ordem | Etapa | Status | Responsável | Data | Observações |
|---|---|---|---|---|---|
| 1 | Base técnica | EM ANDAMENTO |  | 2026-04-29 | Estrutura modular, contratos mínimos e base de persistência criados para suportar a etapa 2; ambiente e artefatos operacionais ainda pendentes. |
| 2 | Domínio e persistência | CONCLUÍDO |  | 2026-04-29 | Entidades, migrations e repositórios iniciais implementados. |
| 3 | Regras de negócio | TODO |  |  |  |
| 4 | APIs e contratos | TODO |  |  |  |
| 5 | Segurança e observabilidade | TODO |  |  |  |
| 6 | Testes e aceite | TODO |  |  |  |

## Ordem de implementação detalhada

| Ordem | Fase | Item | Status | Responsável | Dependência | Evidência | Observações |
|---|---|---|---|---|---|---|---|
| 1 | Base técnica | Definir estrutura modular de pastas conforme a arquitetura | CONCLUÍDO |  | Nenhuma | `src/modules`, `src/shared`, `src/shared/db/migrations` | Estrutura mínima criada para suportar persistência e evolução posterior. |
| 2 | Base técnica | Definir contratos técnicos mínimos: entidades, enums, convenções de rota e nomenclatura | CONCLUÍDO |  | 1 | `src/modules/*/*.types.ts`, `src/shared/db/database.types.ts` | Contratos mínimos de entidades e banco criados; convenções de rota ainda serão usadas nas próximas etapas. |
| 3 | Base técnica | Configurar variáveis de ambiente com validação tipada | TODO |  | 1, 2 |  |  |
| 4 | Base técnica | Configurar `Docker Compose` com `api` e `postgres` | TODO |  | 3 |  |  |
| 5 | Base técnica | Criar artefatos operacionais mínimos: `.env.example`, `.gitignore` e `README.md` | TODO |  | 3, 4 |  |  |
| 6 | Domínio e persistência | Modelar `study_domain` com normalização e unicidade | CONCLUÍDO |  | 2 | `src/modules/domains/domain.types.ts`, `src/shared/utils/normalization.ts` | Regras de tamanho e normalização centralizadas. |
| 7 | Domínio e persistência | Modelar `card` com vínculo obrigatório a domínio e tipo de origem | CONCLUÍDO |  | 2, 6 | `src/modules/cards/card.types.ts` | `sourceType`, `approach`, `front` e `back` modelados com restrições mínimas. |
| 8 | Domínio e persistência | Modelar `processing_request` para rastreabilidade técnica | CONCLUÍDO |  | 2 | `src/modules/processing/processing.types.ts` | Modelo cobre status, domínio informado/resolvido, contadores e falha sanitizada. |
| 9 | Domínio e persistência | Criar migration de `study_domains` | CONCLUÍDO |  | 6 | `src/shared/db/migrations/001_create_study_domains.sql` | Inclui unicidade por `name_normalized` e checks de tamanho. |
| 10 | Domínio e persistência | Criar migration de `cards` com FK para `study_domains` | CONCLUÍDO |  | 7, 9 | `src/shared/db/migrations/002_create_cards.sql` | Inclui FK obrigatória, enum lógico e checks de conteúdo. |
| 11 | Domínio e persistência | Criar migration de `processing_requests` | CONCLUÍDO |  | 8, 9 | `src/shared/db/migrations/003_create_processing_requests.sql` | Inclui status, contadores e vínculos opcionais para domínio. |
| 12 | Domínio e persistência | Implementar repositório de domínios | CONCLUÍDO |  | 9 | `src/modules/domains/domain.repository.ts` | CRUD básico, busca por nome normalizado e listagem paginada. |
| 13 | Domínio e persistência | Implementar repositório de cards | CONCLUÍDO |  | 10 | `src/modules/cards/card.repository.ts` | CRUD, listagem paginada, filtros por domínio, origem e abordagem. |
| 14 | Domínio e persistência | Implementar repositório de processamento | CONCLUÍDO |  | 11 | `src/modules/processing/processing.repository.ts` | Suporta início, sucesso, sucesso sem persistência, falha e consulta. |
| 15 | Regras de negócio | Implementar `DomainService` com unicidade por nome normalizado | TODO |  | 12 |  |  |
| 16 | Regras de negócio | Implementar `CardService` com validação de domínio existente | TODO |  | 13, 15 |  |  |
| 17 | Regras de negócio | Definir DTOs e schemas de validação para domínios | TODO |  | 15 |  |  |
| 18 | Regras de negócio | Definir DTOs e schemas de validação para cards | TODO |  | 16 |  |  |
| 19 | Regras de negócio | Implementar sanitização e limites de entrada para texto puro | TODO |  | 3, 17, 18 |  |  |
| 20 | Regras de negócio | Implementar extração textual de PDF pesquisável | TODO |  | 4 |  |  |
| 21 | Regras de negócio | Implementar conversão de PDF escaneado para imagem | TODO |  | 4, 20 |  |  |
| 22 | Regras de negócio | Implementar OCR de imagem e OCR de PDF escaneado via OpenAI | TODO |  | 21 |  |  |
| 23 | Regras de negócio | Implementar adaptador OpenAI para classificação, sugestão, resumo e cards | TODO |  | 3 |  |  |
| 24 | Regras de negócio | Implementar `ContentProcessingService` com fluxo síncrono, timeout e persistência condicional | TODO |  | 14, 16, 19, 20, 22, 23 |  |  |
| 25 | APIs e contratos | Expor endpoints de CRUD de domínios | TODO |  | 15, 17 |  |  |
| 26 | APIs e contratos | Expor endpoints de CRUD de cards | TODO |  | 16, 18 |  |  |
| 27 | APIs e contratos | Expor endpoint `POST /api/v1/processings` | TODO |  | 24 |  |  |
| 28 | APIs e contratos | Expor `health/live`, `health/ready` e `metrics` | TODO |  | 3, 4 |  |  |
| 29 | APIs e contratos | Padronizar tratamento de erros, status codes e mensagens seguras | TODO |  | 25, 26, 27 |  |  |
| 30 | APIs e contratos | Implementar `requestId`, correlação e resposta padronizada | TODO |  | 25, 26, 27, 29 |  |  |
| 31 | Segurança e observabilidade | Implementar rate limiting e whitelisting de campos atualizáveis | TODO |  | 25, 26, 27, 30 |  |  |
| 32 | Segurança e observabilidade | Implementar upload seguro com validação de MIME, extensão, tamanho, resolução e páginas | TODO |  | 20, 21, 27 |  |  |
| 33 | Segurança e observabilidade | Implementar proteção contra prompt injection indireta e validação da resposta da IA | TODO |  | 22, 23, 24 |  |  |
| 34 | Segurança e observabilidade | Implementar logs estruturados com sanitização e correlação por `requestId` | TODO |  | 29, 30 |  |  |
| 35 | Segurança e observabilidade | Implementar métricas HTTP, de processamento e de chamadas OpenAI | TODO |  | 23, 24, 28, 34 |  |  |
| 36 | Testes e aceite | Implementar testes unitários de domínios, cards e validadores | TODO |  | 15, 16, 17, 18 |  |  |
| 37 | Testes e aceite | Implementar testes unitários de `ContentProcessingService` com mocks determinísticos | TODO |  | 24 |  |  |
| 38 | Testes e aceite | Implementar testes de integração dos CRUDs de domínios e cards | TODO |  | 25, 26, 36 |  |  |
| 39 | Testes e aceite | Implementar testes de integração do endpoint de processamento | TODO |  | 27, 31, 32, 37 |  |  |
| 40 | Testes e aceite | Implementar testes negativos de segurança e falha externa | TODO |  | 31, 32, 33, 39 |  |  |
| 41 | Testes e aceite | Consolidar documentação final, decisões pendentes e limites operacionais | TODO |  | 5, 28, 35, 40 |  |  |
| 42 | Testes e aceite | Validar aceite final por user story, requisito e evidência de teste | TODO |  | 38, 39, 40, 41 |  |  |

## Critérios de pronto

- `US-01` a `US-04` implementadas com evidência de teste.
- Endpoints obrigatórios disponíveis com contratos consistentes.
- Fluxo de processamento aceitando apenas uma origem por requisição.
- Persistência restrita a `study_domains`, `cards` e `processing_requests`.
- Resumo, texto bruto extraído e arquivo original não persistidos.
- Timeout e falha segura respeitados no limite de `30s`.
- Controles mínimos de segurança, logs e métricas ativos.
- Ambiente local executável com `docker compose`.

## Decisões e bloqueios

| Tipo | Descrição | Impacto | Responsável | Status | Observações |
|---|---|---|---|---|---|
| Decisão |  |  |  | TODO |  |
| Bloqueio |  |  |  | TODO |  |
