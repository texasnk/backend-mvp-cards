# API Reference

Referência dos endpoints disponíveis no MVP, baseada no código atual e nas regras registradas em [USs.md](USs.md) e [Arquitetura.md](Arquitetura.md).

## Convenções gerais

- Prefixo base: `/api/v1`
- Formato padrão: `application/json`
- Upload: `multipart/form-data`
- Header de correlação suportado: `X-Request-Id`
- Datas retornadas pela API: strings ISO 8601

## Contrato de erro

Quando a falha é tratada pela aplicação:

```json
{
  "error": {
    "code": "INVALID_FIELD",
    "message": "Field \"name\" must be a non-empty string."
  }
}
```

Quando ocorre falha interna não tratada:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unexpected internal server error."
  }
}
```

Status codes mais comuns no estado atual:

- `400` para erro de validação
- `404` para recurso inexistente
- `409` para conflito
- `502` para falha de integração externa
- `504` para timeout

## Modelos principais

### StudyDomain

```json
{
  "id": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "name": "Cardiologia",
  "nameNormalized": "cardiologia",
  "createdAt": "2026-04-29T12:00:00.000Z",
  "updatedAt": "2026-04-29T12:00:00.000Z"
}
```

### Card

```json
{
  "id": "aaf7d70a-c47b-44a1-b0dd-578de5dfa6e1",
  "studyDomainId": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "sourceType": "manual",
  "approach": "definicao",
  "front": "O que e insuficiencia cardiaca?",
  "back": "E a incapacidade do coracao de suprir adequadamente as demandas do organismo.",
  "createdAt": "2026-04-29T12:00:00.000Z",
  "updatedAt": "2026-04-29T12:00:00.000Z"
}
```

### Paginação

Respostas de listagem seguem este formato:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

## Domains

### `POST /api/v1/domains`

Cria um domínio de estudo.

Request body:

```json
{
  "name": "Cardiologia"
}
```

Regras principais:

- `name` deve ser string não vazia
- a regra de domínio exige entre 3 e 40 caracteres
- nomes normalizados duplicados são rejeitados

Response `201`:

```json
{
  "id": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "name": "Cardiologia",
  "nameNormalized": "cardiologia",
  "createdAt": "2026-04-29T12:00:00.000Z",
  "updatedAt": "2026-04-29T12:00:00.000Z"
}
```

### `GET /api/v1/domains`

Lista domínios com paginação.

Query params:

- `search` opcional
- `page` opcional, padrão `1`
- `pageSize` opcional, padrão `20`

Exemplo:

```text
GET /api/v1/domains?search=cardio&page=1&pageSize=20
```

Response `200`:

```json
{
  "items": [
    {
      "id": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
      "name": "Cardiologia",
      "nameNormalized": "cardiologia",
      "createdAt": "2026-04-29T12:00:00.000Z",
      "updatedAt": "2026-04-29T12:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### `GET /api/v1/domains/:id`

Consulta um domínio por identificador.

Response `200`: `StudyDomain`

### `PATCH /api/v1/domains/:id`

Atualiza o nome do domínio.

Request body:

```json
{
  "name": "Cardiologia Clinica"
}
```

Response `200`: `StudyDomain`

### `DELETE /api/v1/domains/:id`

Remove o domínio.

Response `204`: sem body.

## Cards

### `POST /api/v1/cards`

Cria um card manual.

Request body:

```json
{
  "studyDomainId": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "front": "O que e insuficiencia cardiaca?",
  "back": "E a incapacidade do coracao de suprir adequadamente as demandas do organismo.",
  "approach": "definicao"
}
```

Regras principais:

- `studyDomainId` é obrigatório
- `front` e `back` devem ser strings não vazias e ter pelo menos 3 caracteres
- `approach` é opcional
- `approach`, quando informado, deve ser um destes valores:
  - `definicao`
  - `comparacao`
  - `causa_efeito`
  - `aplicacao_pratica`
  - `armadilha_conceitual`
  - `verdadeiro_falso`

Response `201`:

```json
{
  "id": "aaf7d70a-c47b-44a1-b0dd-578de5dfa6e1",
  "studyDomainId": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "sourceType": "manual",
  "approach": "definicao",
  "front": "O que e insuficiencia cardiaca?",
  "back": "E a incapacidade do coracao de suprir adequadamente as demandas do organismo.",
  "createdAt": "2026-04-29T12:00:00.000Z",
  "updatedAt": "2026-04-29T12:00:00.000Z"
}
```

### `GET /api/v1/cards`

Lista cards com paginação.

Query params:

- `studyDomainId` opcional
- `sourceType` opcional: `manual` ou `generated`
- `approach` opcional
- `page` opcional, padrão `1`
- `pageSize` opcional, padrão `20`

Exemplo:

```text
GET /api/v1/cards?studyDomainId=2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74&sourceType=manual&page=1&pageSize=20
```

Response `200`:

```json
{
  "items": [
    {
      "id": "aaf7d70a-c47b-44a1-b0dd-578de5dfa6e1",
      "studyDomainId": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
      "sourceType": "manual",
      "approach": "definicao",
      "front": "O que e insuficiencia cardiaca?",
      "back": "E a incapacidade do coracao de suprir adequadamente as demandas do organismo.",
      "createdAt": "2026-04-29T12:00:00.000Z",
      "updatedAt": "2026-04-29T12:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### `GET /api/v1/cards/:id`

Consulta um card por identificador.

Response `200`: `Card`

### `PATCH /api/v1/cards/:id`

Atualiza parcialmente um card.

Request body de exemplo:

```json
{
  "front": "Qual e a definicao de insuficiencia cardiaca?",
  "approach": "definicao"
}
```

Observações:

- `front`, `back` e `approach` são opcionais
- `approach` pode ser `null`

Response `200`: `Card`

### `DELETE /api/v1/cards/:id`

Remove um card manual ou gerado.

Response `204`: sem body.

## Processings

### `POST /api/v1/processings`

Executa extração, OCR, classificação opcional de domínio, geração de resumo e geração de cards.

Regra principal:

- a requisição deve conter exatamente uma origem de conteúdo: `text` ou `file`

### Opção 1: JSON com texto

Headers:

- `Content-Type: application/json`

Request body:

```json
{
  "requestId": "optional-request-id",
  "inputType": "text",
  "text": "Conteudo em texto puro para resumo e geracao de cards.",
  "domainId": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
  "cardsCount": 3
}
```

Campos:

- `requestId` opcional
- `inputType` opcional; se informado com texto, deve ser `text`
- `text` obrigatório nesta modalidade
- `domainId` opcional
- `cardsCount` opcional, inteiro

### Opção 2: multipart com arquivo

Headers:

- `Content-Type: multipart/form-data`

Campos esperados:

- `file` obrigatório
- `domainId` opcional
- `cardsCount` opcional
- `requestId` opcional
- `inputType` opcional; se informado, deve bater com o arquivo recebido:
  - `pdf` para `application/pdf`
  - `image` para imagem suportada

Arquivo aceito:

- PDF
- imagem compatível com o `MimeValidator`

Validações aplicadas:

- tamanho máximo do upload
- tipo MIME e extensão
- páginas máximas do PDF
- resolução máxima de imagem

### Response `200` com domínio resolvido

```json
{
  "requestId": "optional-request-id",
  "inputType": "pdf",
  "summary": "Resumo geral em PT-BR.",
  "domain": {
    "mode": "provided",
    "id": "2c93f8e8-1d80-4af1-8bf8-bcab6ff61c74",
    "name": "Cardiologia"
  },
  "suggestedDomain": null,
  "cards": [
    {
      "id": "1b3980ea-13a1-4d58-9f65-f3971b286b38",
      "front": "O que e insuficiencia cardiaca?",
      "back": "E a incapacidade do coracao de suprir adequadamente as demandas do organismo.",
      "approach": "definicao"
    }
  ]
}
```

Observações:

- `domain.mode` pode ser `provided` ou `classified`
- quando houver `domain`, os cards podem ser persistidos e retornar `id`

### Response `200` sem domínio aderente

```json
{
  "requestId": "optional-request-id",
  "inputType": "image",
  "summary": "Resumo geral em PT-BR.",
  "domain": null,
  "suggestedDomain": {
    "name": "Farmacologia Basica"
  },
  "cards": [
    {
      "id": null,
      "front": "O que sao agonistas adrenegicos?",
      "back": "Sao substancias que ativam receptores adrenergicos.",
      "approach": "definicao"
    }
  ]
}
```

Observações:

- quando não houver domínio resolvido, `domain` é `null`
- `suggestedDomain` pode ser `null`
- cards não persistidos retornam `id: null`

## Operação

### `GET /api/v1/health/live`

Response `200`:

```json
{
  "status": "ok"
}
```

### `GET /api/v1/health/ready`

Response `200` quando pronto:

```json
{
  "status": "ready"
}
```

Response `503` quando não pronto:

```json
{
  "status": "not_ready",
  "details": {
    "database": "unavailable"
  }
}
```

### `GET /api/v1/metrics`

Response `200`:

- `Content-Type: text/plain`
- corpo em formato texto estilo Prometheus

Exemplo:

```text
http_requests_total{method="GET",route="/api/v1/health/live",status="200"} 3
http_request_duration_ms{method="GET",route="/api/v1/health/live"}_count 3
http_request_duration_ms{method="GET",route="/api/v1/health/live"}_sum 12
http_request_duration_ms{method="GET",route="/api/v1/health/live"}_avg 4
```
