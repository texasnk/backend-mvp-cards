# ADR-001 — Deduplicação e exclusão em massa

## Decisão

Cards são considerados duplicados quando possuem o mesmo `studyDomainId`, `front` e `back`.
Importações continuam com os itens únicos e retornam os duplicados em `failures`.

Os endpoints `DELETE /api/v1/cards/bulk` e `DELETE /api/v1/domains/bulk` recebem `{ "ids": ["..."] }`, retornam os IDs removidos e as falhas, sem desfazer os demais itens. Excluir um domínio remove antes todos os seus cards.
