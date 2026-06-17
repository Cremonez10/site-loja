# JoFogo V1 - Arquitetura

## Objetivo
Definir a arquitetura final do projeto JoFogo para garantir uma base consistente, discreta e focada na V1 do catálogo adulto.

## Stack final
- Next.js App Router
- TypeScript com `strict` habilitado
- Tailwind CSS
- PostgreSQL
- Prisma
- Playwright

## Estrutura de pastas final
- `app/(public)` - rotas públicas do catálogo, age gate e páginas visíveis após aceite 18+
- `app/(admin)` - painel administrativo protegido por autenticação
- `app/api` - endpoints de backend e APIs serverless
- `components/catalog` - componentes de listagem e filtros do catálogo
- `components/product` - componentes de página de produto e detalhes
- `components/order` - mini-pedido e fluxo de intenção de compra
- `components/admin` - painel e formulários administrativos
- `components/layout` - componentes de layout compartilhados
- `lib/services` - regras de negócio e orquestração do domínio
- `lib/validators` - validações de entrada e dados
- `lib/formatters` - formatação de valores, textos e exibições
- `lib/analytics` - registro e padronização de eventos analíticos
- `prisma` - schema e migrações para PostgreSQL
- `docs` - documentação do projeto

## Visão geral
JoFogo V1 é um catálogo discreto, mobile-first, com confirmação 18+ antes da exposição do catálogo.
- O age gate bloqueia busca e renderização de produtos até o aceite.
- O mini-pedido representa apenas intenção de compra, sem checkout ou pagamento.
- O WhatsApp tem fallback obrigatório para copiar a mensagem se o app não puder ser aberto.
- O painel admin é separado e protegido por middleware.

## Admin e segurança
- O painel `/admin` e todas as rotas de `/api/admin` devem ser protegidos pelo middleware.
- A autenticação admin usa sessão persistida em cookie `admin_session` HttpOnly.
- `/admin/signin` permanece acessível publicamente para permitir login.

## Regras chave
- Produtos não devem ser buscados ou renderizados antes do aceite 18+.
- Produtos com status `ACTIVE` ou `OUT_OF_STOCK` podem aparecer no catálogo público.
- Produtos `INACTIVE` não devem ser exibidos para visitantes.
- Produtos internos devem ser marcados `noindex` em metadados.

## Decisões de arquitetura
- Separar regras de negócio de apresentação em `lib/services`.
- Separar validações em `lib/validators`.
- Separar formatações em `lib/formatters`.
- Separar analytics em `lib/analytics`.
- Evitar lógica complexa dentro de componentes React.
- Tratar erros em fluxos críticos e registrar eventos analíticos relevantes.

## Observações
- Não implementar marketplace, login de cliente ou IA na V1.
- A arquitetura é limitada ao catálogo adulto, mini-pedido de intenção e painel admin.
- Documentação e código devem refletir este escopo.
