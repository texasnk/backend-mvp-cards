# Cardly Frontend

Interface para o MVP de flashcards, feita em React, TypeScript, React Query e Zustand.

## Rodar localmente

1. Inicie o backend na porta `3000` (ou defina `VITE_API_URL` em um arquivo `.env`).
2. Instale as dependências: `npm install`.
3. Execute: `npm run dev`.
4. Acesse `http://localhost:5173`.

## Scripts

- `npm run dev` — ambiente de desenvolvimento.
- `npm run build` — checagem TypeScript e bundle de produção.
- `npm run lint` — validação ESLint.
- `npm run format` — formatação Prettier.

A organização segue Atomic Design em `components`, serviços por domínio em `services`, hooks React Query em `domains` e filtros globais em `store`.
