# ADR-002 — Migração para Prisma e separação de camadas

## Status

Aceito.

## Contexto

Os repositórios legados misturam SQL direto e Prisma, dificultando tipagem, manutenção e testes isolados das services.

## Decisão

Os repositórios passarão a usar exclusivamente `PrismaClient`. As regras e o tratamento de erros permanecem nas services; controllers apenas validam a entrada HTTP e chamam a service. Services e repositories serão organizados em `src/services/<dominio>` e `src/repositories/<dominio>`, com `types.ts` em cada domínio.

Toda função alterada nesta migração deve referenciar `SPEC-ORM-*`.

## Consequências

O cliente Prisma passa a ser a única dependência de persistência da aplicação. Testes de service usam contratos mockados, sem banco ou SQL simulado.
