# Backend MVP Cards

## Descrição

API backend em TypeScript para cadastro de domínios de estudo, CRUD de cards manuais e geração síncrona de cards a partir de texto, imagem ou PDF.

O projeto foi estruturado como um monólito modular com foco em:

- simplicidade operacional do MVP
- contratos HTTP claros
- rastreabilidade do processamento
- separação entre regras de negócio, providers e persistência

## Tecnologias

- Node.js 22
- TypeScript
- Express
- PostgreSQL
- Jest
- Docker Compose
- OpenAI API
- `pdf-parse-new` para extração textual de PDF

## Escopo atual

- CRUD de `study_domains`
- CRUD de `cards`
- `POST /api/v1/processings` com suporte a:
  - `application/json` com `text`
  - `multipart/form-data` com `file`
- OCR por visão para imagem
- extração textual local para PDF pesquisável
- classificação automática de domínio e sugestão de novo domínio
- geração de resumo e cards via OpenAI
- `health/live`, `health/ready` e `metrics`

## Estrutura de documentação

- [docs/API-Reference.md](docs/API-Reference.md)
- [docs/USs.md](docs/USs.md)
- [docs/Arquitetura.md](docs/Arquitetura.md)
- [docs/Checklist-Implementacao.md](docs/Checklist-Implementacao.md)
- [docs/Checklist-Final-Aceite.md](docs/Checklist-Final-Aceite.md)
- [docs/Validacao-Final.md](docs/Validacao-Final.md)

## Arquivos obrigatórios presentes

- `package.json`
- `tsconfig.json`
- `jest.config.ts`
- `.env.example`
- `docker-compose.yml`
- `Dockerfile`
- `LICENSE`

## Instalação

### Requisitos

- Node.js 22+
- PostgreSQL local ou Docker

### Variáveis de ambiente

Use `.env.example` como base.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não | Porta HTTP da API |
| `DATABASE_URL` | sim | String de conexão com PostgreSQL |
| `OPENAI_API_KEY` | sim | Chave da OpenAI |
| `OPENAI_MODEL_TEXT` | sim | Modelo para classificação, sugestão e geração |
| `OPENAI_MODEL_VISION` | sim | Modelo para OCR multimodal |
| `MAX_FILE_SIZE_MB` | não | Limite de upload |
| `MAX_TEXT_CHARS` | não | Limite de texto processável |
| `MAX_CARDS_PER_REQUEST` | não | Máximo de cards gerados |
| `DEFAULT_CARDS_PER_REQUEST` | não | Quantidade padrão de cards |
| `REQUEST_TIMEOUT_MS` | não | Timeout dos adaptadores externos |
| `ALLOWED_CORS_ORIGINS` | não | Lista separada por vírgula |
| `LOG_LEVEL` | não | Nível de log |
| `DOMAIN_MATCH_THRESHOLD` | não | Limiar de aderência do domínio classificado |
| `PROCESSING_RATE_LIMIT_MAX_REQUESTS` | não | Limite de requisições de processamento |
| `PROCESSING_RATE_LIMIT_WINDOW_MS` | não | Janela do rate limit |
| `MAX_PDF_PAGES` | não | Limite de páginas por PDF |
| `MAX_IMAGE_WIDTH` | não | Largura máxima de imagem |
| `MAX_IMAGE_HEIGHT` | não | Altura máxima de imagem |
| `BODY_LIMIT` | não | Limite do body JSON |

### Passos

1. Instale dependências:

```bash
npm install
```

2. Ajuste o ambiente:

```bash
cp .env.example .env
```

3. Suba o banco local com Docker:

```bash
docker compose up -d postgres
```

4. Rode as migrations:

```bash
npm run db:migrate
```

5. Suba a API:

```bash
npm run dev
```

## Execução com Docker Compose

```bash
docker compose up --build
```

O compose sobe `postgres` e `api`. A API usa o `DATABASE_URL` interno do compose.

## Uso

### Scripts

```bash
npm run dev
npm run build
npm run start
npm test
npm run db:migrate
```

### Endpoints principais

| Método | Rota | Objetivo |
|---|---|---|
| `POST` | `/api/v1/domains` | criar domínio |
| `GET` | `/api/v1/domains` | listar domínios |
| `GET` | `/api/v1/domains/:id` | consultar domínio |
| `PATCH` | `/api/v1/domains/:id` | atualizar domínio |
| `DELETE` | `/api/v1/domains/:id` | remover domínio |
| `POST` | `/api/v1/cards` | criar card manual |
| `GET` | `/api/v1/cards` | listar cards |
| `GET` | `/api/v1/cards/:id` | consultar card |
| `PATCH` | `/api/v1/cards/:id` | atualizar card |
| `DELETE` | `/api/v1/cards/:id` | remover card |
| `POST` | `/api/v1/processings` | processar conteúdo |
| `GET` | `/api/v1/health/live` | liveness |
| `GET` | `/api/v1/health/ready` | readiness |
| `GET` | `/api/v1/metrics` | métricas HTTP |

### Contratos esperados

Os contratos completos de request e response estão em [docs/API-Reference.md](docs/API-Reference.md).

Cobertura do guia:

- payloads esperados por endpoint
- descrição do que representa cada campo principal
- enums disponíveis por contrato
- responses de sucesso
- responses de erro
- paginação
- processamento com `text`
- processamento com `multipart/form-data`
- health e metrics

### Exemplos de processamento

#### Texto puro

```bash
curl -X POST http://localhost:3000/api/v1/processings \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Texto base para gerar cards",
    "cardsCount": 3
  }'
```

#### Upload de PDF ou imagem

```bash
curl -X POST http://localhost:3000/api/v1/processings \
  -F "file=@/caminho/arquivo.pdf" \
  -F "cardsCount=3"
```

## Integração com IA

A IA é usada em quatro responsabilidades principais:

- OCR de imagem
- classificação de conteúdo em um domínio existente
- geração de resumo, cards e sugestão de domínio

Fluxo atual:

1. o conteúdo é convertido para texto utilizável
2. se não houver `domainId`, a IA tenta classificar entre os domínios existentes
3. se não houver aderência suficiente, a IA pode sugerir um novo domínio
4. a IA gera resumo e cards em PT-BR
5. os cards só são persistidos quando houver domínio resolvido

Observações importantes:

- o resumo não é persistido
- o texto bruto extraído não é persistido
- o arquivo original não é persistido
- respostas da IA são tratadas como não confiáveis e passam por validação estrutural mínima
- PDFs sem camada de texto utilizável são rejeitados no fluxo atual

## Limitações atuais

- o aceite final ainda depende de validação com PostgreSQL real
- o fluxo de processamento ainda precisa ser validado com chave OpenAI real
- ainda faltam testes de integração HTTP
- ainda faltam testes negativos de segurança
- a persistência dos cards gerados ainda não está encapsulada em transação explícita

## Qualidade já validada

- `npm run build` executado com sucesso em `2026-04-29`
- `npm test` executado com sucesso em `2026-04-29`

## Documentação relacionada

- [API-Reference.md](docs/API-Reference.md)
- [USs.md](docs/USs.md)
- [Arquitetura.md](docs/Arquitetura.md)
- [Planejamento.md](docs/Planejamento.md)
- [Checklist-Implementacao.md](docs/Checklist-Implementacao.md)
- [Validacao-Final.md](docs/Validacao-Final.md)

## Licença

Este projeto possui licença MIT versionada no repositório em [LICENSE](LICENSE).
