# Checklist Final de Aceite

## Configuração obrigatória

- [x] `package.json` com scripts de `dev`, `build`, `start`, `test` e `db:migrate`
- [x] `tsconfig.json`
- [x] `jest.config.ts`
- [x] `.env.example`
- [x] `.gitignore`
- [x] `LICENSE` MIT
- [x] `Dockerfile`
- [x] `docker-compose.yml`
- [x] bootstrap real da aplicação em `src/app/bootstrap.ts`
- [x] entrypoint em `src/main.ts`

## Base funcional

- [x] migrations SQL para `study_domains`, `cards` e `processing_requests`
- [x] cliente PostgreSQL e readiness por banco
- [x] CRUD de domínios
- [x] CRUD de cards
- [x] processamento síncrono com texto, imagem e PDF
- [x] extração textual de PDF pesquisável
- [x] fallback para OCR de PDF escaneado
- [x] classificação automática de domínio
- [x] sugestão de domínio quando não houver aderência
- [x] persistência condicional de cards gerados

## Segurança e operação

- [x] `requestId`
- [x] logs estruturados
- [x] rate limit básico
- [x] CORS explícito
- [x] headers mínimos de segurança
- [x] validação de MIME e extensão
- [x] limite de upload por tamanho
- [x] inspeção de páginas de PDF
- [x] inspeção de resolução de imagem
- [x] métricas HTTP expostas em `/api/v1/metrics`

## Validação executada

- [x] `npm run build`
- [x] `npm test`
- [ ] `npm run db:migrate` contra PostgreSQL real
- [ ] teste manual do fluxo `/api/v1/processings` com OpenAI real
- [ ] testes de integração HTTP
- [ ] testes negativos de segurança
- [ ] transação explícita para persistência dos cards gerados

## Parecer

O repositório já possui os artefatos obrigatórios de configuração, documentação e execução local. O que ainda separa o projeto de um aceite integral é validação contra infraestrutura real e fechamento de alguns itens de robustez, não mais ausência de base técnica.
