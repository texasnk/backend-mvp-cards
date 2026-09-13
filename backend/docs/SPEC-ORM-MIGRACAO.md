# SPEC-ORM-MIGRACAO

## SPEC-ORM-01 — Persistência Prisma

Todo repositório deve usar exclusivamente o cliente Prisma e converter o modelo persistido para o contrato do domínio.

## SPEC-ORM-02 — Organização das camadas

Services ficam em `src/services/<dominio>` e repositories em `src/repositories/<dominio>`. Cada pasta contém o arquivo principal e `types.ts`.

## SPEC-ORM-03 — Erros de service

Services devem transformar falhas conhecidas em `AppError` usando helpers compartilhados. Controllers não contêm regra de negócio.

## SPEC-ORM-04 — Testes

Testes unitários de service usam mocks tipados dos contratos de repositório e providers, validando entradas, saídas e erros esperados.
