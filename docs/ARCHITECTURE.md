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
- `app/` - rotas públicas e páginas principais
- `app/admin/` - painel administrativo protegido por autenticação
- `app/admin/signin/` - página pública de login admin
- `app/api/` - endpoints de backend e APIs serverless
- `components/` - componentes de interface reutilizáveis
- `lib/` - código de apoio, validações, formatação e serviços
- `prisma/` - schema e migrações para PostgreSQL
- `docs/` - documentação do projeto

## Visão geral
JoFogo V1 é um catálogo discreto, mobile-first, com confirmação 18+ antes da exposição do catálogo.
- O age gate bloqueia busca e renderização de produtos até o aceite.
- O mini-pedido representa apenas intenção de compra, sem checkout ou pagamento.
- O WhatsApp tem fallback obrigatório para copiar a mensagem se o app não puder ser aberto.
- O painel admin é separado e protegido por middleware.

## Admin e segurança
- O painel `/admin` e todas as rotas de `/api/admin` são protegidos pelo middleware.
- `/admin/signin` permanece acessível publicamente para permitir acesso ao formulário.
- `/admin` sem cookie `admin_session` redireciona para `/admin/signin`.
- `/api/admin` sem cookie `admin_session` retorna JSON 401:
  - `{ "error": "Unauthorized" }`

## Lib/prisma
- `lib/prisma.ts` exporta um singleton `prisma` compatível com hot reload do Next.js.
- Em desenvolvimento, Prisma loga `query`, `warn` e `error`.
- Em produção, Prisma loga `warn` e `error`.

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
