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

## Estrutura inicial de pastas
- `app/(public)` - rotas públicas do catálogo e fluxo cliente
- `app/(admin)` - painel admin protegido
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
- `prisma` - schema do banco
- `docs` - documentação
