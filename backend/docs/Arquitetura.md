# Arquitetura Backend MVP

## 1. Objetivo

Definir uma arquitetura backend para o MVP do sistema de estudo com cards de memória, priorizando simplicidade, modularidade, segurança e evolução controlada.

O escopo considerado neste documento deriva de [USs.md](/docs/USs.md:1) e de [fase-1.md](/prompts/fase-1.md:1).

## 2. Princípios de arquitetura

### Recomendado para o MVP

- Monólito modular em `Node.js + TypeScript`.
- API REST com `Express`.
- Validação de entrada com `Joi`.
- Banco relacional único com `PostgreSQL`.
- Execução local via `Docker Compose`.
- Processamento síncrono de upload/extração/OCR/geração.
- Integração com OpenAI encapsulada por adaptador próprio.
- Persistência apenas do que é necessário ao negócio e à auditoria técnica mínima.

Convenção de linguagem:

- Código, nomes de arquivos, tipos, tabelas, campos e endpoints em inglês.
- Documentação arquitetural e justificativas em PT-BR.

### Alternativa futura

- Separar processamento pesado em fila assíncrona.
- Extrair OCR e IA para serviços independentes apenas quando houver volume, custo ou SLA que justifiquem.

## 3. Visão de alto nível

### Diagrama textual

```text
Cliente HTTP
  |
  v
Express API
  |
  +--> Middlewares
  |      - request-id
  |      - security headers
  |      - rate limit
  |      - multipart parser
  |      - validation
  |
  +--> Controllers
  |      - domains
  |      - cards
  |      - processing
  |
  +--> Application Services
  |      - DomainService
  |      - CardService
  |      - ContentProcessingService
  |
  +--> Providers
  |      - PdfTextExtractor
  |      - VisionOcrProvider
  |      - OpenAiGeneratorProvider
  |
  +--> Repositories
  |      - DomainRepository
  |      - CardRepository
  |      - ProcessingRequestRepository
  |
  +--> PostgreSQL
  |
  +--> Logs estruturados / métricas / healthchecks
```

## 4. Componentes principais

| Componente | Responsabilidade | Recomendado no MVP | Alternativa futura |
|---|---|---|---|
| API REST | Expor CRUD e processamento | `Express` | `Fastify` se houver necessidade de throughput maior |
| Camada de validação | Validar payload, query, params e multipart metadata | `Joi` por rota | OpenAPI-first com geração automática |
| Serviços de aplicação | Orquestrar casos de uso | Classes simples por módulo | CQRS apenas se a complexidade crescer |
| Repositórios | Isolar acesso ao banco | SQL com query builder ou ORM leve | ORM mais completo se o modelo crescer |
| Banco | Persistir domínios, cards e trilha mínima de processamento | `PostgreSQL` | Separar leitura/escrita somente com escala real |
| Extração de PDF textual | Extrair texto nativamente de PDFs pesquisáveis | Biblioteca Node dedicada | Serviço externo especializado |
| OCR/visão | Ler imagem enviada | OpenAI com entrada de imagem | OCR local especializado |
| Geração IA | Resumo, cards, classificação e sugestão de domínio | OpenAI via adaptador próprio | Multi-provider com fallback |
| Observabilidade | Logs, métricas e healthchecks | logger estruturado + métricas Prometheus | tracing distribuído completo |

## 5. Estrutura lógica sugerida

```text
package.json
tsconfig.json
jest.config.ts (ou equivalente)
docker-compose.yml
LICENSE
src/
  app/
    server.ts
    app.ts
    routes/
    middlewares/
    errors/
  modules/
    domains/
      domain.controller.ts
      domain.service.ts
      domain.repository.ts
      domain.schemas.ts
      domain.types.ts
    cards/
      card.controller.ts
      card.service.ts
      card.repository.ts
      card.schemas.ts
      card.types.ts
    processing/
      processing.controller.ts
      processing.service.ts
      processing.repository.ts
      processing.schemas.ts
      processing.types.ts
      prompt-builder.ts
  providers/
    ai/
      openai.client.ts
      openai.generator.ts
      openai.vision-ocr.ts
    files/
      pdf-text-extractor.ts
      mime-validator.ts
      temp-file-manager.ts
  shared/
    config/
    db/
    logger/
    utils/
    telemetry/
tests/
docker/
```

## 5.1 Artefatos obrigatórios do repositório

Além da árvore de código, o MVP deve incluir artefatos versionados suficientes para execução local e evolução básica do projeto:

- `package.json` com scripts mínimos de `dev`, `build`, `test` e `start`.
- `tsconfig.json` compatível com a estrutura modular em `src/`.
- configuração de testes automatizados, como `jest.config.ts` ou equivalente adotado pelo projeto.
- `.env.example` com variáveis mínimas documentadas.
- `.gitignore` adequado para Node.js, TypeScript, segredos e artefatos temporários.
- `README.md` com setup local, uso e dependências adotadas.
- `docker-compose.yml` com `postgres` obrigatório e `api` recomendado no MVP.
- `LICENSE` com texto da licença MIT.

Decisão recomendada:

- Tratar esses artefatos como parte da definição de pronto da base técnica, e não como documentação opcional.

## 6. Fluxo de dados

### 6.1 CRUD de domínios

1. Cliente envia requisição REST.
2. `Joi` valida payload.
3. `DomainService` aplica regra de unicidade por nome normalizado.
4. Repositório persiste ou consulta no PostgreSQL.
5. API retorna payload padronizado.

### 6.2 CRUD de cards

1. Cliente informa `studyDomainId`, `front`, `back`.
2. `Joi` valida mínimo de caracteres e enum de abordagem quando aplicável.
3. `CardService` confirma existência do domínio.
4. Repositório persiste card manual.
5. API retorna card criado/consultado/alterado/excluído.

### 6.3 Processamento de conteúdo

1. Cliente envia exatamente uma origem: `text`, `image` ou `pdf`.
2. Middleware multipart valida tipo, tamanho e limites.
3. `ContentProcessingService` registra início do processamento com `request_id`.
4. O conteúdo é convertido para texto:
   - `text`: sanitização e truncamento defensivo.
   - `pdf`: tentativa de extração textual local.
   - `image`: OCR por visão na OpenAI.
   - `pdf` sem texto utilizável: falha controlada sem fallback OCR no backend atual.
5. Se não houver texto utilizável, a operação falha sem persistir cards.
6. Se `domainId` vier preenchido, o sistema usa o domínio informado.
7. Se `domainId` não vier:
   - carrega domínios existentes;
   - pede à OpenAI classificação entre os domínios existentes;
   - se não houver aderência, pede sugestão de nome de domínio.
8. O sistema solicita à OpenAI:
   - resumo geral em PT-BR;
   - cards estruturados em PT-BR;
   - enum de abordagem por card.
9. O sistema valida a resposta da IA contra schema.
10. Em transação, persiste apenas os cards gerados quando houver domínio resolvido.
11. O sistema finaliza o registro técnico da operação.
12. A API retorna resumo, cards gerados, domínio associado quando existir e sugestão quando aplicável.

## 7. APIs REST sugeridas

### 7.1 Convenções

- Prefixo: `/api/v1`
- JSON como formato padrão.
- `multipart/form-data` apenas para upload.
- Header de correlação: `X-Request-Id`
- Datas em ISO 8601 UTC.

### 7.2 Endpoints agrupados

#### Domains

| Método | Rota | Input sugerido | Output sugerido | Justificativa |
|---|---|---|---|---|
| `POST` | `/api/v1/domains` | body com `name` | `id`, `name`, `createdAt`, `updatedAt` | Manter criação explícita e simples para evitar duplicidade semântica no catálogo. |
| `GET` | `/api/v1/domains` | query com `search`, `page`, `pageSize` | lista paginada de domínios | Paginação evita resposta crescente demais e `search` cobre consulta administrativa básica. |
| `GET` | `/api/v1/domains/:id` | `id` em path | domínio completo | Leitura direta por identificador mantém contrato previsível. |
| `PATCH` | `/api/v1/domains/:id` | `id` em path e body com `name` | domínio atualizado | `PATCH` reduz necessidade de payload completo para alteração simples. |
| `DELETE` | `/api/v1/domains/:id` | `id` em path | `204 No Content` | Remoção sem payload reduz ambiguidade de retorno. |

#### Cards

| Método | Rota | Input sugerido | Output sugerido | Justificativa |
|---|---|---|---|---|
| `POST` | `/api/v1/cards` | body com `studyDomainId`, `front`, `back`, `approach` opcional | card criado | Mantém CRUD manual separado do processamento automático e facilita governança do conteúdo. |
| `GET` | `/api/v1/cards` | query com `studyDomainId`, `sourceType`, `approach`, `page`, `pageSize` | lista paginada de cards | Esses filtros são os mais úteis no MVP por cobrirem domínio, origem e tipo pedagógico sem complexidade de busca textual. |
| `GET` | `/api/v1/cards/:id` | `id` em path | card completo | Consulta unitária é necessária para edição e auditoria operacional. |
| `PATCH` | `/api/v1/cards/:id` | `id` em path e body parcial com `front`, `back`, `approach` | card atualizado | `PATCH` suporta manutenção incremental de cards sem reenviar todo o recurso. |
| `DELETE` | `/api/v1/cards/:id` | `id` em path | `204 No Content` | Exclusão única cobre cards manuais e gerados com o mesmo contrato. |

#### Processing and operations

| Método | Rota | Input sugerido | Output sugerido | Justificativa |
|---|---|---|---|---|
| `POST` | `/api/v1/processings` | body JSON com `text`, `domainId`, `cardsCount` ou `multipart/form-data` com `file`, `domainId`, `cardsCount` | `requestId`, `inputType`, `summary`, `domain`, `suggestedDomain`, `cards` | Unificar o caso de uso principal em um endpoint reduz coordenação no cliente e preserva rastreabilidade. |
| `GET` | `/api/v1/health/live` | sem input | status simples | Liveness separado evita acoplamento com dependências externas. |
| `GET` | `/api/v1/health/ready` | sem input | status + readiness mínima | Readiness permite verificar banco e configuração essencial antes de receber tráfego. |
| `GET` | `/api/v1/metrics` | sem input | métricas Prometheus | Exposição dedicada simplifica scraping operacional. |

### 7.3 Filtros recomendados

| Rota | Filtros |
|---|---|
| `/api/v1/domains` | `search`, `page`, `pageSize` |
| `/api/v1/cards` | `studyDomainId`, `sourceType`, `approach`, `page`, `pageSize` |

Motivos dos filtros sugeridos:

- `search` em domínios é suficiente no MVP porque a entidade tem baixa cardinalidade e busca administrativa simples.
- `studyDomainId` em cards atende o caso principal de navegação por assunto.
- `sourceType` separa cards manuais e gerados sem criar endpoint adicional.
- `approach` ajuda revisão pedagógica e troubleshooting da geração.
- `page` e `pageSize` evitam respostas grandes e deixam o custo previsível.

### 7.4 Payload sugerido para processamento

#### Opção texto puro

```json
{
  "text": "conteudo em texto puro",
  "domainId": "uuid-opcional",
  "cardsCount": 3
}
```

#### Opção upload

`multipart/form-data`

Campos:

- `file`: PDF ou imagem
- `domainId`: opcional
- `cardsCount`: obrigatório

### 7.5 Resposta sugerida do processamento

```json
{
  "requestId": "uuid",
  "inputType": "pdf",
  "summary": "Resumo geral em PT-BR",
  "domain": {
    "mode": "provided",
    "id": "uuid",
    "name": "Sistema Cardiovascular"
  },
  "suggestedDomain": null,
  "cards": [
    {
      "id": "uuid",
      "front": "Pergunta",
      "back": "Resposta",
      "approach": "definicao"
    }
  ]
}
```

#### Quando não houver domínio aderente

```json
{
  "requestId": "uuid",
  "inputType": "image",
  "summary": "Resumo geral em PT-BR",
  "domain": null,
  "suggestedDomain": {
    "name": "Farmacologia Básica"
  },
  "cards": [
    {
      "id": null,
      "front": "Pergunta",
      "back": "Resposta",
      "approach": "definicao"
    }
  ]
}
```

### Decisão recomendada

Quando não houver domínio aderente, retornar `summary`, `cards` e `suggestedDomain`, mas não persistir cards. Isso mantém consistência com a regra de que todo card persistido pertence a um domínio e evita cards órfãos sem sacrificar o valor imediato da resposta ao cliente.

### Alternativa futura

Persistir cards em estado `pending_domain_review` caso o produto passe a exigir revisão humana antes do vínculo.

## 8. Modelo de dados

### 8.1 Entidades principais

| Entidade | Finalidade |
|---|---|
| `study_domains` | Catálogo de domínios de estudo |
| `cards` | Cards manuais e gerados |
| `processing_requests` | Auditoria técnica mínima das operações de processamento |

### 8.2 Tabela `study_domains`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `varchar(40)` | Nome exibido |
| `name_normalized` | `varchar(40)` | Lowercase/trim para unicidade |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Restrições:

- `unique(name_normalized)`
- tamanho entre 3 e 40

### 8.3 Tabela `cards`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK |
| `study_domain_id` | `uuid` | FK para `study_domains` |
| `source_type` | `varchar(20)` | `manual` ou `generated` |
| `approach` | `varchar(30)` | enum lógico |
| `front` | `text` | mínimo 3 chars |
| `back` | `text` | mínimo 3 chars |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Enum lógico de `approach`:

- `definicao`
- `comparacao`
- `causa_efeito`
- `aplicacao_pratica`
- `armadilha_conceitual`
- `verdadeiro_falso`

### 8.4 Tabela `processing_requests`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK e `requestId` externo |
| `input_type` | `varchar(20)` | `text`, `image`, `pdf` |
| `provided_domain_id` | `uuid` | Nullable |
| `resolved_domain_id` | `uuid` | Nullable |
| `status` | `varchar(30)` | `started`, `succeeded`, `failed`, `succeeded_without_persistence` |
| `cards_requested` | `smallint` | |
| `cards_created` | `smallint` | Quantidade gerada pela IA |
| `cards_persisted` | `smallint` | Quantidade efetivamente persistida |
| `suggested_domain_name` | `varchar(40)` | Nullable |
| `extracted_text_chars` | `integer` | |
| `failure_code` | `varchar(50)` | Nullable |
| `failure_reason` | `text` | Sanitizada, sem dados sensíveis |
| `started_at` | `timestamptz` | |
| `finished_at` | `timestamptz` | Nullable |

### Decisão recomendada

Não persistir o texto extraído bruto, o resumo nem o arquivo original no banco do MVP.

Motivos:

- reduz exposição de dados sensíveis;
- simplifica LGPD e retenção;
- atende ao requisito de não persistir resumo;
- evita crescimento prematuro do banco.

### Alternativa futura

Persistir artefatos em object storage com criptografia e política de retenção se auditoria funcional passar a exigir reprocessamento.

## 8.5 Infraestrutura local e toolchain

O projeto deve ser inicializável localmente sem configuração implícita fora do repositório.

Artefatos mínimos esperados:

- `package.json` para gerenciar dependências, scripts e metadados do serviço.
- `tsconfig.json` para compilar TypeScript de forma determinística.
- configuração de testes para permitir execução automatizada via script do projeto.
- `docker-compose.yml` para subir pelo menos o `postgres` localmente; a inclusão do serviço `api` no compose é a opção preferida do MVP.
- `LICENSE` MIT para explicitar o regime de uso e distribuição do código.

Critério arquitetural:

- um colaborador deve conseguir instalar dependências, subir o banco local e executar os comandos principais do backend apenas com os arquivos versionados e as instruções do `README.md`.

## 9. Integração com OpenAI

### 9.1 Responsabilidades da integração

- OCR por visão para imagem enviada.
- Classificação de domínio quando `domainId` não vier informado.
- Sugestão de domínio quando não houver aderência.
- Geração de resumo.
- Geração de cards estruturados.

### 9.2 Decisão recomendada

Usar um adaptador próprio `OpenAiProvider` baseado na API de respostas e retorno estruturado por schema JSON.

Motivos:

- isola o provedor de IA do restante da aplicação;
- reduz parsing frágil de texto livre;
- facilita testes com mocks determinísticos;
- permite trocar modelo ou provedor depois sem contaminar serviços de negócio.

### 9.3 Estratégia de chamadas

#### Recomendado no MVP

- Chamada 1: OCR/extração por visão, quando necessário.
- Chamada 2: classificação de domínio ou sugestão, se `domainId` não vier.
- Chamada 3: geração única de resumo + cards em payload estruturado.

#### Alternativa futura

- Separar resumo e geração de cards para otimização de prompts, custo e retry granular.

### 9.4 Contrato lógico esperado da IA

```json
{
  "summary": "string",
  "cards": [
    {
      "front": "string",
      "back": "string",
      "approach": "definicao"
    }
  ]
}
```

### 9.5 Regras de resiliência

- Timeout hard de 30 segundos por chamada crítica.
- `AbortController` para cancelamento.
- Retry no máximo 1 vez apenas em falhas transitórias idempotentes de infraestrutura.
- Sem retry automático para respostas semanticamente inválidas da IA.
- Validação do retorno com schema antes de qualquer persistência.
- Logs sem conteúdo bruto sensível.

### 9.6 Modelos

#### Recomendado no MVP

- Modelo multimodal leve para OCR/visão.
- Modelo com suporte confiável a structured outputs para classificação e geração.

#### Alternativa futura

- Roteamento por tarefa:
  - modelo mais barato para classificação;
  - modelo mais robusto para geração de cards complexos.

### 9.7 Prompting

- Prompt de sistema com instruções em PT-BR e contratos técnicos em inglês quando envolver nomes de campos, enums e schemas.
- Instruções explícitas para não inventar conteúdo fora do texto.
- Saída obrigatória em schema validado.
- Lista de domínios existentes enviada de forma controlada e truncada.

## 10. Processamento de arquivos

### 10.1 Tipos aceitos

- `application/pdf`
- `image/png`
- `image/jpeg`
- `image/webp` se houver necessidade real

### 10.2 Pipeline recomendado

| Entrada | Etapa 1 | Etapa 2 | Saída |
|---|---|---|---|
| Texto puro | validação de tamanho | sanitização | texto |
| PDF textual | extração local | validação de conteúdo | texto |
| PDF sem texto utilizável | rejeição controlada | resposta de erro | sem texto |
| Imagem | normalização de resolução | OCR via OpenAI | texto |

### 10.3 Regras operacionais

- Arquivos temporários apenas em diretório local efêmero.
- Exclusão imediata após sucesso ou falha.
- Limite padrão de 10 MB por arquivo.
- Limite máximo de 40 páginas por PDF.
- Limite máximo de 720p para imagem aceita.
- Rejeitar MIME inválido e extensão divergente.
- Não aceitar múltiplos arquivos por requisição.

### 10.4 Dependências técnicas recomendadas

| Necessidade | Recomendado no MVP |
|---|---|
| Upload multipart | `multer` |
| Detecção MIME | `file-type` ou validação equivalente |
| Extração de PDF textual | biblioteca Node dedicada para texto |
| Compressão/redimensionamento | `sharp` |

### Alternativa futura

Mover processamento pesado de arquivos para worker assíncrono se o tempo médio ultrapassar o SLA.

## 11. Segurança baseada em OWASP 2025

Esta seção combina controles aplicáveis do OWASP Top 10:2025 para aplicações web com o OWASP API Security Top 10:2023, por serem diretamente aderentes ao contexto REST do MVP.

### 11.1 Controles recomendados

| Risco | Aplicação no MVP | Controle recomendado |
|---|---|---|
| Broken Access Control | Exposição indevida de recursos por ID | Preparar camada de autorização por recurso, mesmo sem autenticação do produto no MVP |
| Security Misconfiguration | Headers, CORS, debug, containers | `helmet`, CORS explícito, sem stack trace externo, imagens mínimas |
| Software Supply Chain Failures | Dependências Node e utilitários de OCR/PDF | lockfile, scanner de vulnerabilidade, versões fixadas |
| Cryptographic Failures | Segredos e tráfego | TLS fora do container, `.env` fora do git, rotação de chave |
| Injection | SQL, prompt injection indireta, logs | queries parametrizadas, sanitização, não interpolar SQL |
| Insecure Design | Fluxo síncrono e IA sem schema | validação forte, limite de volume, schema estrito |
| Authentication Failures | Caso a API seja exposta externamente | não expor sem gateway; alternativa futura com API key/JWT |
| Software/Data Integrity Failures | Respostas da IA e arquivos | validação por schema, verificação MIME, checksum opcional |
| Logging and Alerting Failures | Auditoria insuficiente | logs estruturados, correlação por request id, falhas externas registradas |
| Mishandling of Exceptional Conditions | timeouts, falhas parciais | erro padronizado, rollback transacional, cleanup de arquivos |

### 11.2 Controles específicos de API

| Risco API | Controle recomendado |
|---|---|
| API1 BOLA | nunca confiar apenas no `id`; validar existência e escopo do recurso |
| API3 Broken Object Property Level Authorization | whitelist de campos atualizáveis no `PATCH` |
| API4 Unrestricted Resource Consumption | rate limit, limite de tamanho, limite de cards, timeout |
| API6 Sensitive Business Flows | proteger endpoint de processamento contra abuso e automação |
| API7 SSRF | não aceitar URLs externas do usuário para download de arquivos |
| API8 Security Misconfiguration | desabilitar endpoints de debug e mensagens verbosas |
| API9 Inventory Management | versionar API em `/v1` e manter documentação mínima |
| API10 Unsafe Consumption of APIs | tratar OpenAI como entrada não confiável; validar sempre |

### 11.3 Medidas concretas

- `helmet` para headers de segurança.
- CORS fechado por variável de ambiente.
- Rate limiting por IP no endpoint de processamento.
- Body limit e multipart limit explícitos.
- SQL sempre parametrizado.
- Sanitização de logs para remover texto completo, arquivo e segredo.
- Segredos apenas via ambiente.
- Docker rodando com usuário não-root.
- Container sem portas desnecessárias.
- Política de erro sem stack trace em produção.
- Health endpoints sem detalhes sensíveis.

## 12. Observabilidade

### 12.1 Logs

#### Recomendado no MVP

- JSON estruturado.
- Campos mínimos:
  - `timestamp`
  - `level`
  - `service`
  - `requestId`
  - `route`
  - `method`
  - `statusCode`
  - `durationMs`
  - `integration`
  - `errorCode`

#### Não registrar

- conteúdo integral do arquivo;
- texto extraído completo;
- prompt completo com dados sensíveis;
- chave da OpenAI.

### 12.2 Métricas

| Métrica | Uso |
|---|---|
| `http_requests_total` | volume por rota |
| `http_request_duration_ms` | latência |
| `processing_requests_total` | volume de processamentos |
| `processing_failures_total` | taxa de falha |
| `openai_calls_total` | consumo por integração |
| `openai_call_duration_ms` | latência externa |
| `cards_generated_total` | volume de saída |

### 12.3 Health checks

- `live`: processo em pé.
- `ready`: API pronta, banco acessível e configuração essencial presente.

### Alternativa futura

Adicionar tracing distribuído com OpenTelemetry quando houver múltiplos serviços ou filas.

## 13. Stack técnica recomendada

| Camada | Recomendado no MVP |
|---|---|
| Runtime | `Node.js` LTS |
| Linguagem | `TypeScript` |
| Web | `Express` |
| Validação | `Joi` |
| Testes | `Jest 30` |
| Execução TS local | `ts-node` |
| Integração Jest + TS | `ts-jest` |
| Banco | `PostgreSQL` |
| Containerização | `Docker` + `docker compose` |
| Upload | `multer` |
| Logs | `pino` ou equivalente |
| Config | `dotenv` + módulo de config tipado |
| Métricas | `prom-client` |
| HTTP client | `undici` ou SDK oficial |

### Observação

`node-ts` foi interpretado como uso de `ts-node` para execução TypeScript em desenvolvimento e `ts-jest` para testes com TypeScript. Essa leitura é a mais aderente ao contexto porque ambos resolvem diretamente o ciclo local pedido para o MVP sem impor boilerplate extra.

## 14. Estratégia de testes

### Recomendado no MVP

- Unitários para serviços e validadores.
- Integração para repositórios e rotas principais.
- Mock da OpenAI nos testes automatizados.
- Testes de contrato dos schemas de resposta da IA.
- Testes negativos para limites de arquivo, timeout, domínio inválido e conteúdo sem texto.

### Casos críticos

- não permitir múltiplas origens na mesma requisição;
- não persistir resumo;
- não persistir cards em falha da OpenAI;
- persistir cards apenas com domínio resolvido;
- rejeitar cards fora do schema.

## 15. Infraestrutura local com Docker

### Recomendado no MVP

Serviços no `docker compose`:

- `api`
- `postgres`

Dependências de sistema no container da API:

- bibliotecas nativas exigidas por `sharp`, se utilizado

### Variáveis de ambiente mínimas

| Variável | Finalidade |
|---|---|
| `PORT` | porta da API |
| `DATABASE_URL` | conexão Postgres |
| `OPENAI_API_KEY` | autenticação OpenAI |
| `OPENAI_MODEL_TEXT` | modelo para resumo/cards/classificação |
| `OPENAI_MODEL_VISION` | modelo para OCR/visão |
| `MAX_FILE_SIZE_MB` | padrão 10 |
| `MAX_TEXT_CHARS` | padrão 10000 |
| `MAX_CARDS_PER_REQUEST` | padrão 10 |
| `REQUEST_TIMEOUT_MS` | padrão 30000 |
| `ALLOWED_CORS_ORIGINS` | CORS |
| `LOG_LEVEL` | logs |

### Artefatos operacionais sugeridos

| Artefato | Conteúdo mínimo | Justificativa |
|---|---|---|
| `.env.example` | variáveis obrigatórias sem segredos reais | Acelera onboarding local e reduz erro de configuração entre ambientes. |
| `.gitignore` | `node_modules`, `.env`, logs, cobertura, temporários e artefatos de build | Evita vazamento de segredo e ruído de versionamento. |
| `README.md` | contexto do projeto, instruções de uso, setup local, decisões principais do MVP e lista das bibliotecas utilizadas com a função de cada uma no projeto | Reduz dependência de conhecimento tácito, acelera onboarding técnico e deixa explícito o papel de cada dependência adotada no MVP. |

## 16. Riscos técnicos

| Risco | Impacto | Mitigação MVP |
|---|---|---|
| OCR ruim em imagem de baixa qualidade | cards incorretos | limite de resolução, normalização e mensagem clara de falha |
| PDF sem texto utilizável | rejeição do conteúdo | comunicar limitação e exigir PDF com camada de texto ou imagem separada |
| Resposta inconsistente da IA | persistência inválida | structured outputs + validação Joi/schema |
| Custo variável da OpenAI | impacto operacional | limite de tamanho, limite de cards, logs de consumo |
| Ambiguidade na classificação de domínio | cards no domínio errado | pedir classificação apenas entre domínios existentes e aplicar critério mínimo de aderência |
| Falha parcial entre IA e banco | inconsistência | transação e persistência apenas após validação final |
| Dependência de binário de conversão PDF | fragilidade em ambiente | fixar imagem Docker e validar startup |
| Ausência de autenticação no produto | risco se exposto na internet | uso apenas em rede confiável no MVP ou proteção por gateway externo |

## 17. Evolução pós-MVP

### Recomendado apenas após validação do produto

1. Processamento assíncrono com fila e status de job.
2. Object storage para arquivos temporários auditáveis.
3. Autenticação/autorização por usuário, tenant ou workspace.
4. Versionamento de prompts e avaliação automática de qualidade.
5. Estratégia multi-modelo para reduzir custo.
6. Reprocessamento e revisão humana de cards gerados.
7. Busca textual e filtros mais avançados.
8. Tracing distribuído e dashboards operacionais.

### Não recomendado no MVP

- Microsserviços.
- Event bus.
- Vetor database.
- Pipeline complexo de agentes.

## 18. Ambiguidades

- Não está definido o critério objetivo de aderência mínima para classificar um domínio existente quando houver vários candidatos plausíveis.

## 19. Perguntas pendentes

- Não há perguntas pendentes além da definição objetiva do critério de aderência mínima entre domínios candidatos.

## 20. Decisão final recomendada

Para o MVP, a melhor relação entre simplicidade, segurança e capacidade de evolução é:

- monólito modular em `Express + TypeScript`;
- `PostgreSQL` como banco único;
- processamento síncrono;
- extração local para PDF textual;
- OCR multimodal via OpenAI para imagens;
- geração estruturada via OpenAI com validação por schema;
- persistência apenas de domínios, cards e trilha técnica mínima;
- observabilidade básica com logs estruturados, métricas e healthchecks;
- controles de segurança aderentes ao OWASP Top 10:2025 e OWASP API Security Top 10:2023.
