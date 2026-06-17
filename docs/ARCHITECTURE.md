# JoFogo V1 - Arquitetura

## Objetivo
Documentar a arquitetura final da aplicação JoFogo para garantir clareza sobre componentes, responsabilidades e decisões técnicas.

## Visão geral da arquitetura
JoFogo V1 usa uma stack web moderna focada em catálogo adulto discreto, mobile-first e seguro.
- Framework: Next.js App Router
- Linguagem: TypeScript com strict mode
- UI: Tailwind CSS
- Banco de dados: PostgreSQL
- ORM: Prisma
- Testes: Playwright
- Auth admin: sessão segura com cookie HttpOnly
- Estado do mini-pedido: localStorage

## Estrutura de pastas
- `app/(public)` - rotas públicas do catálogo e páginas de cliente
- `app/(admin)` - painel administrativo protegido
- `app/api` - APIs serverless e endpoints de backend
- `components` - componentes React reutilizáveis
- `lib/services` - regras de negócio e orquestração
- `lib/validators` - validações de entrada e dados
- `lib/formatters` - formatação de valores e texto
- `lib/analytics` - registro de eventos analíticos
- `prisma` - schema e migrações do banco de dados
- `docs` - documentação do projeto

## Componentes principais

### Frontend
- Gate 18+ para bloquear acesso ao catálogo até o aceite.
- Catálogo responsivo com filtros e busca.
- Página de detalhe do produto (PDP) com informações discretas.
- Mini-pedido em localStorage representando intenção de compra.
- Integração WhatsApp com fallback de cópia de mensagem.
- Painel admin separado para gestão de produtos e categorias.

### API / Backend
- Endpoints em `app/api` para produtos, categorias, admin e analytics.
- Lógica de visibilidade de produto por status (`ACTIVE`, `OUT_OF_STOCK`, `INACTIVE`).
- Autenticação admin por sessão com cookie HttpOnly.
- Prisma como camada ORM para PostgreSQL.

### Persistência
- Tabelas: `Product`, `Category`, `Brand`, `ProductImage`, `ProductAttribute`, `ProductCategory`, `OrderDraft`, `OrderItem`, `AnalyticsEvent`, `AdminUser`.
- Relação muitos-para-muitos entre produtos e categorias.
- Estado do mini-pedido mantido localmente no navegador.

## Regras de visibilidade
- Produtos e catálogo não devem ser buscados ou renderizados antes do aceite 18+.
- O age gate deve bloquear qualquer requisição de produto pública até que o visitante aceite.
- Produtos internos devem ser marcados `noindex` na renderização e nos metadados.

## Segurança do admin
- Rotas admin protegidas por middleware de autenticação.
- O middleware valida sessão e cookie HttpOnly antes de renderizar páginas ou APIs admin.
- O painel admin não deve ser acessível sem login.

## Decisões de arquitetura
- Fixar stack em Next.js App Router e TypeScript strict.
- Usar Tailwind CSS para interface consistente e responsiva.
- Separar regras de negócio de apresentação em `lib/services`.
- Colocar validações em `lib/validators` e formatações em `lib/formatters`.
- Colocar analytics em `lib/analytics` para rastrear ações relevantes.
- Evitar lógica complexa dentro de componentes React.

## Riscos técnicos
- O WhatsApp depende do ambiente do usuário; fallback de cópia é obrigatório.
- Estado em localStorage exige sincronização correta com o fluxo de mini-pedido.
- Autenticação do admin em sessão deve proteger rotas e APIs.
- O age gate deve impedir exposição de produtos antes de aceitação.

## Observações de implantação
- Validar routes e middleware de admin.
- Aplicar `noindex` em produtos internos via metadados e header.
- Garantir que todas as ações críticas capturem eventos analíticos.
