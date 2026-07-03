# JoFogo

JoFogo é um catálogo adulto discreto mobile-first com confirmação 18+, mini-pedido e painel admin protegido.

## Setup inicial

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```
Edite `.env.local` com as credenciais do PostgreSQL.

### 3. Gerar Prisma Client
```bash
npm run db:generate
```

### 4. Criar migração inicial
```bash
npm run db:migrate
```

### 5. Rodar em desenvolvimento
```bash
npm run dev
```

## Scripts úteis
- `npm run dev` - iniciar servidor Next.js em modo de desenvolvimento
- `npm run build` - construir o app para produção
- `npm run start` - iniciar o app construído
- `npm run lint` - executar lint
- `npm run format` - formatar todo o código
- `npm run db:migrate` - aplicar migração do Prisma
- `npm run db:generate` - gerar Prisma Client
- `npm run test` - executar testes Playwright
- `npm run test:report` - abrir relatório do Playwright

## Documentação

- [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) — Checklist de prontidão para produção (Phase 6A)
- [`docs/pre-release-audit.md`](docs/pre-release-audit.md) — Auditoria pré-release MVP (Phase 5D)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitetura do projeto
- [`docs/COMPLIANCE_NOTES.md`](docs/COMPLIANCE_NOTES.md) — Notas de compliance / LGPD

## Estrutura inicial
- `app/(public)` - rotas públicas do catálogo e fluxo cliente
- `app/(admin)` - painel admin protegido
- `app/api` - APIs internas
- `components` - componentes reaproveitáveis
- `lib/services` - regras de negócio
- `lib/validators` - validações
- `lib/formatters` - formatação BRL
- `lib/analytics` - registro de eventos analíticos mockados
- `prisma` - schema e migrações do banco de dados
- `docs` - documentação do projeto

## Validação do setup
1. `npm install`
2. `npm run lint`
3. `npm run build`
4. `npm run test`

Se esses comandos rodarem sem erros, o setup inicial está correto.

## Regras de implementação
- Não implementar checkout online.
- Não implementar marketplace.
- Não implementar login de cliente.
- Não implementar IA.
- Não buscar nem renderizar produtos antes do aceite 18+.
- Rotas públicas e admin apenas como esqueleto nesta fase.
- Middleware preparada para proteger rotas `/admin`.
- Mini-pedido ainda será gerenciado por localStorage.
