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

## Fase 4A - Banco de dados e seed de desenvolvimento
- Inicie o PostgreSQL local no Codespaces ou em outro ambiente com suporte a Docker.
- Configure `DATABASE_URL` no arquivo `.env` com a URL do banco local.
- Valide o schema com `npx prisma validate`.
- Gere a migration inicial com `npx prisma migrate dev --name init`.
- Rode `npm run db:seed` para popular o banco com dados de desenvolvimento.
- Não versionar o arquivo `.env`.
- O seed é para desenvolvimento e testes, não representa o catálogo final.

## Fase 4B - Autenticação admin e Age Gate

- Admin de desenvolvimento criado via seed:
	- email: admin@jofogo.dev
	- senha dev: Dev@2026!
- Regras e notas:
	- `ADMIN_AUTH_SECRET` é obrigatório para assinar cookies de sessão admin.
	- A sessão admin é armazenada em cookie HttpOnly chamado `admin_session` e assinado com HMAC-SHA256.
	- A sessão tem duração de 8 horas.
	- O age gate é persistido localmente por 30 dias via cookie e `localStorage` (apenas para liberar conteúdo institucional).
	- Não usar as credenciais de desenvolvimento em produção.

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
