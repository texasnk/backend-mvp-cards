# ADR-003 — Contratos de repositório, Prisma e erros de service

## Status

Aceito.

## Contexto

Parte dos repositórios usava SQL direto e os testes de service simulavam esse detalhe de infraestrutura. Isso acoplava testes à consulta e permitia que regras das services fossem contornadas.

## Decisão

Todos os repositórios usam `PrismaClient` e expõem contratos em `src/repositories/<domínio>/types.ts`, prefixados com `I`. Services recebem esses contratos, não implementações concretas, e convertem falhas inesperadas com `handleServiceError`.

Os testes unitários devem fornecer dublês tipados desses contratos e validar a entrada encaminhada, a saída e o erro esperado.

## Consequências

O acesso ao banco fica restrito aos repositórios Prisma. Services ficam testáveis sem banco, SQL ou conversões de tipo inseguras.
