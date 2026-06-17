# Setup inicial do projeto JoFogo

Este documento registra o setup inicial do projeto JoFogo e as decisões tomadas.

## Stack escolhida
- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Prisma
- PostgreSQL
- ESLint
- Prettier
- Playwright

## Atualização da Fase 3.2
A Fase 3.2 corrige:
- middleware de proteção admin e APIs
- singleton Prisma em `lib/prisma.ts`
- schema Prisma com índices, defaults e relacionamentos seguros
- `package.json` com bloco `overrides` válido
- documentação de arquitetura e setup

## Comandos de validação
- `npm run db:generate`
- `npx prisma validate`
- `npm run lint`
- `npm run build`
- `npm run test`
- `npm audit`

## Estrutura inicial de pastas
- `app/` - rotas públicas do catálogo e fluxos públicos
- `app/admin/` - painel admin protegido
- `app/admin/signin/` - página de acesso público para admin
- `app/api` - APIs internas
- `components/catalog` - componentes de catálogo
- `components/product` - componentes de produto
- `components/order` - componentes de mini-pedido
- `components/admin` - componentes de admin
- `components/layout` - layout e containers
- `lib/services` - regras de negócio
- `lib/validators` - validações
- `lib/formatters` - formatação BRL
- `lib/analytics` - tracking mockado
- `lib/prisma.ts` - singleton Prisma compatível com Next.js
- `prisma` - schema do banco
- `docs` - documentação
