# JoFogo V1 - Auditoria Pre-Release

> **Branch:** `feature/fase5d-pre-release-audit-draft`
> **Data:** 2026-07-02
> **Fase:** 5D - Auditoria MVP pre-lancamento
> **Status:** rascunho para revisao antes de merge em `main`

---

## 1. Resumo executivo

Este documento consolida a revisao do escopo do MVP JoFogo V1, confirma os comportamentos implementados, lista limitacoes conhecidas e define os bloqueadores que devem ser resolvidos antes de qualquer merge em `main` ou deploy em producao.

O JoFogo V1 e um catalogo adulto discreto, mobile-first, com:

- Age gate obrigatorio
- Catalogo publico paginado com filtro por categoria e busca
- Pagina de detalhe do produto (PDP)
- Fluxo de "Tenho interesse" (intencao de compra sem pagamento)
- Painel admin protegido com visualizacao de interesses registrados

---

## 2. Fluxo do usuario publico (revisado)

| Passo | Rota / Componente | Comportamento esperado | Testado? |
|---|---|---|---|
| 1. Chegada ao site | `GET /` -> `<AgeGate>` | Age gate exibido antes de qualquer produto | Sim - `age-gate.spec.ts` |
| 2. Aceite 18+ | `<AgeGate>` confirma -> cookie `age_confirmed=1` + `localStorage` | Catalogo liberado, cookie valido por 30 dias | Sim - `age-gate.spec.ts` |
| 3. Recusa 18+ | `<AgeGate>` nega | Mensagem de bloqueio, catalogo nao renderizado | Sim - `age-gate.spec.ts` |
| 4. Navegacao do catalogo | `<CatalogClient>` -> `GET /api/categories`, `GET /api/products` | Produtos ACTIVE e OUT_OF_STOCK visiveis; INACTIVE ocultos | Sim - `catalog-api.spec.ts` |
| 5. Filtro por categoria | `<CategoryFilter>` | Filtra produtos por categoria sem requisicao adicional de paginacao | Visual - sem teste de UI dedicado |
| 6. Busca | `<ProductSearch>` | Busca por nome/descricao, maximo 80 caracteres | Visual - sem teste de UI dedicado |
| 7. Pagina de produto | `GET /products/[slug]` -> `<ProductDetailClient>` | Nome, preco, status; age gate antes se nao confirmado | Sim - `product-detail.spec.ts` |
| 8. Produto esgotado | `OUT_OF_STOCK` | Badge "Indisponivel no momento", botao de interesse ausente | Sim - `product-detail.spec.ts` |
| 9. Interesse em produto ativo | Botao `#pdp-interest-btn` -> `POST /api/order-drafts` | `OrderDraft` criado; estado de sucesso exibido | Sim - `product-detail.spec.ts` |
| 10. Falha no interesse | API retorna 5xx | Estado de erro exibido; botao permanece para retry | Sim - `product-detail.spec.ts` |

**Observacoes:**

- Nao ha testes de UI automatizados para filtro por categoria e busca no catalogo (passos 5 e 6). Ver Secao 9 - Checklist de QA manual.
- A PDP de produto interno (`internal=true`) retorna 404 via API e nao e exposta publicamente.

---

## 3. Fluxo do administrador (revisado)

| Passo | Rota / Componente | Comportamento esperado | Testado? |
|---|---|---|---|
| 1. Acesso sem sessao | `GET /admin` | Redirecionamento para `/admin/signin` | Sim - `auth.spec.ts` |
| 2. Login invalido | `POST /api/admin/auth/signin` | Erro "Credenciais invalidas.", sem cookie | Sim - `auth.spec.ts` |
| 3. Login valido | `POST /api/admin/auth/signin` | Cookie `admin_session` HttpOnly, HMAC-SHA256, 8h | Sim - `auth.spec.ts` |
| 4. Dashboard admin | `GET /admin` com sessao | Link `#admin-nav-interests` visivel | Sim - `admin-interests.spec.ts` |
| 5. Interesses - sem sessao | `GET /api/admin/interests` | 401 `{ "error": "Unauthorized" }` | Sim - `admin-interests.spec.ts` |
| 6. Interesses - com sessao | `GET /api/admin/interests` | Lista de `OrderDraft` com itens; forma correta | Sim - `admin-interests.spec.ts` |
| 7. Pagina de interesses | `GET /admin/interests` | Heading visivel; tabela ou empty state; sem termos proibidos | Sim - `admin-interests.spec.ts` |
| 8. Pagina de interesses (mobile) | `GET /admin/interests` viewport 390x844 | Sem overflow horizontal; heading visivel; cards renderizados | Sim - `admin-interests.spec.ts` |
| 9. Logout | `POST /api/admin/auth/signout` | Cookie removido; redirecionamento para `/admin/signin` | Sim - `auth.spec.ts` |

**Observacoes:**

- A sessao admin tem duracao de 8 horas. Nao ha refresh ou renovacao automatica na V1.
- O admin nao possui acoes de criar, editar, alterar status ou excluir produtos na V1 atual do painel.
- Nenhuma rota admin expoe dados de clientes. Os `OrderDraft` nao armazenam nome, e-mail, telefone ou CPF.

---

## 4. Suposicoes de seguranca

| Item | Implementacao atual | Risco residual |
|---|---|---|
| Protecao do painel admin | Middleware Next.js verifica `admin_session` (HMAC-SHA256) em todas as rotas `/admin/*` e `/api/admin/*` | Sessao de 8h sem revogacao. Em caso de roubo de cookie, a sessao permanece valida ate expirar. |
| Segredo de sessao | `ADMIN_AUTH_SECRET` via variavel de ambiente; nao versionado | Se `.env` for exposto, todos os cookies emitidos ficam comprometidos. Rotacao manual necessaria. |
| Age gate | Cookie `age_confirmed` + `localStorage`; verificado pelo servidor antes de cada chamada de catalogo/order-draft | Cookie nao e assinado nem HttpOnly. Pode ser forjado pelo cliente. Aceitavel para V1 (confirmacao de preferencia, nao seguranca critica). |
| APIs publicas de catalogo | Requerem `age_confirmed` cookie; filtram `internal=false` e `status IN (ACTIVE, OUT_OF_STOCK)` | Produtos internos nao sao expostos publicamente, mas a tentativa de criar um draft com um ID invalido devolve 400 em vez de 404, o que pode confirmar existencia. Risco baixo na V1. |
| API de analytics | Rejeita PII em qualquer nivel de aninhamento; aceita apenas nomes de evento documentados | Sem rate limiting. Abuso por bots pode gerar custo de escrita no banco. |
| Order-drafts | Valida items, quantity (1-20), duplicatas, notes <= 500 chars; rejeita produtos OUT_OF_STOCK e INACTIVE | Sem rate limiting por IP ou sessao. Criacao massiva de drafts e possivel. |
| Cabecalhos HTTP de seguranca | Nao configurados explicitamente em `next.config.mjs` | Faltam: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Relevante para producao. |
| HTTPS | Dependente do ambiente de deploy | Nao aplicavel na V1 local; deve ser obrigatorio em producao. |

---

## 5. Suposicoes de privacidade / LGPD

| Item | Status na V1 |
|---|---|
| Login de cliente | Nao implementado. Nenhum dado pessoal de cliente e coletado. |
| Armazenamento de PII | `OrderDraft` e `OrderItem` armazenam apenas `productName`, `quantity`, `priceSnapshot` - sem nome, e-mail, CPF ou telefone do cliente. |
| Cookies | `age_confirmed` (preferencia de idade, 30 dias), `admin_session` (HttpOnly, 8h). Nenhum cookie de rastreamento de terceiros. |
| Analytics | `POST /api/analytics/events` rejeita metadados com chaves PII (`email`, `phone`, `whatsapp`, `cpf`, `document`, `password`, `address`). |
| Politica de privacidade / aviso de cookies | Nao existe pagina de politica de privacidade ou aviso de cookies na V1. Necessario antes de lancamento publico. |
| `robots.txt` | Nao existe `robots.txt` ou `app/robots.ts` configurado. Admin e produtos internos podem ser rastreados por buscadores. |
| Noindex em produtos internos | Campo `Product.noindex` existe no schema. Implementacao de metadado `noindex` na PDP deve ser verificada. |
| Retencao de dados | `OrderDraft` nao tem TTL automatico. Registros crescem indefinidamente. Politica de retencao e uma lacuna de V1. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` no `.env.example` | Variavel presente no bundle publico do cliente. O valor atual e ficticio. Deve ser configurado apenas se e quando o fluxo WhatsApp for implementado em versao futura. Nao e bloqueador de V1. |

---

## 6. Funcionalidades confirmadas fora do escopo (V1)

As seguintes funcionalidades foram deliberadamente excluidas da V1 e nao devem ser incluidas antes do merge em `main`:

| Funcionalidade | Confirmacao |
|---|---|
| Carrinho de compras persistido | Ausente - fora do escopo V1. |
| Checkout online | Ausente - fora do escopo V1. |
| Processamento de pagamento | Ausente - fora do escopo V1. |
| Calculo de frete | Ausente - fora do escopo V1. |
| Integracao WhatsApp | **Fora do escopo da V1.** Nenhuma UI de envio para WhatsApp existe no codigo atual. `PRODUCT_SCOPE.md` e `UX_FLOW.md` descrevem o fluxo WhatsApp como intencao futura; esses documentos precisam ser alinhados com o escopo real da V1 em revisao separada. |
| Login / cadastro de cliente | Ausente - fora do escopo V1. |
| Coleta de dados pessoais do cliente | Ausente - fora do escopo V1. |
| IA ou recomendacoes algoritmicas | Ausente - fora do escopo V1. |
| Imagens ou copy explicito adulto | Ausente - seed usa nomes discretos. |
| Claims medicos ou de desempenho | Ausente - fora do escopo V1. |
| Marketplace / multi-lojista | Ausente - fora do escopo V1. |
| Gestao de produtos pelo admin na UI | Admin so le interesses. CRUD de produtos nao esta na UI atual. |
| Termos proibidos no copy | Verificado por testes automatizados: os termos `comprar`, `carrinho`, `checkout`, `pagamento`, `frete`, `whatsapp`, `finalizar pedido` e `pedido final` estao ausentes nas paginas publicas e admin. |

---

## 7. Limitacoes conhecidas da V1

1. **Sem rate limiting.** `POST /api/order-drafts` e `POST /api/analytics/events` nao tem protecao contra chamadas em massa. Um atacante pode criar centenas de `OrderDraft` ou eventos por segundo.

2. **Age gate nao assinado.** O cookie `age_confirmed` pode ser forjado por qualquer cliente. Aceitavel para V1 (gate de preferencia, nao de seguranca critica), mas deve ser documentado para equipes juridicas.

3. **Sessao admin sem revogacao.** Nao ha mecanismo de invalidar uma sessao especifica antes do vencimento de 8 horas (ex.: logout forcado por senha comprometida).

4. **Sem `robots.txt`.** O painel admin (`/admin`) e rotas de API podem ser indexados por buscadores.

5. **Sem politica de privacidade nem aviso de cookies.** Obrigatorio pela LGPD antes de lancamento publico no Brasil.

6. **Sem cabecalhos de seguranca HTTP.** `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` nao estao configurados.

7. **`OrderDraft` sem TTL / retencao.** Interesses se acumulam indefinidamente. Nao ha politica de limpeza automatica.

8. **Sem tratamento de erro global de UI.** Erros de rede nao tratados por `ErrorBoundary` podem produzir telas em branco no catalogo.

9. **Metadado `noindex` na PDP nao auditado neste PR.** O campo `Product.noindex` existe no schema, mas nao foi verificado se o componente `ProductDetailClient` gera a tag `<meta name="robots" content="noindex">` corretamente para produtos internos. Esses produtos nao sao acessiveis via rota publica, mas a tag e uma segunda camada de defesa.

10. **Sem cobertura de UI automatizada para filtro de categoria e busca.** Os testes atuais cobrem a API; o comportamento do `CategoryFilter` e `ProductSearch` em diferentes viewports depende de QA manual.

11. **Admin CRUD de produtos ausente.** O `PRODUCT_SCOPE.md` descreve criar e editar produtos pelo admin, mas essa UI nao existe na V1 atual. Gestao de catalogo requer acesso direto ao banco de dados.

12. **Desalinhamento de documentacao legada sobre WhatsApp.** `PRODUCT_SCOPE.md` e `UX_FLOW.md` descrevem o fluxo WhatsApp como parte do MVP, mas o WhatsApp esta confirmadamente fora do escopo da V1. Esses documentos devem ser atualizados em revisao separada para refletir o escopo real implementado. Nao e bloqueador de runtime.

---

## 8. Cobertura de testes atual

Total validado apos Phase 5C.1: **45 testes passando**.

| Arquivo de teste | Testes | O que cobre |
|---|---|---|
| `age-gate.spec.ts` | 1 (fluxo completo) | Exibicao, aceite, rejeicao, persistencia do age gate |
| `catalog-api.spec.ts` | 7 | `/api/categories`, `/api/products`, `/api/products/[slug]`, filtragem de INACTIVE/internal, paginacao |
| `order-draft-api.spec.ts` | 6 | Protecao por age, validacao de payload, duplicatas, qty maxima, notas longas, produto fora de estoque |
| `analytics-api.spec.ts` | 6 | Evento valido, evento desconhecido, PII aninhado, PII direto, metadata grande, nome vazio |
| `auth.spec.ts` | 1 (fluxo completo) | 401 sem cookie, redirect, login invalido, login valido, logout |
| `product-detail.spec.ts` | 8 | Age gate na PDP, produto ativo, produto nao encontrado, termos proibidos, OUT_OF_STOCK, interesse, sucesso, erro |
| `admin-interests.spec.ts` | 12 | Auth, redirect, API 200/401, formato de dados, termos proibidos, mobile viewport, overflow horizontal |
| `example.spec.ts` | 1 | Sanidade basica (health route) |
| **Total** | **45** | Numero reflete resultado do runner apos Phase 5C.1. Nenhum teste foi adicionado na Phase 5D. |

**Lacunas identificadas:**

- Nenhum teste automatizado de UI para `CategoryFilter` e `ProductSearch`.
- Nenhum teste de metadado `noindex` na PDP.
- Nenhum teste de cabecalhos de seguranca HTTP.

---

## 9. Checklist de QA manual

Executar em ambiente de staging antes do merge em `main`. Marcar cada item como OK (passou), FALHOU ou PARCIAL.

### 9.1 Age Gate

- [ ] Acesso a `/` sem confirmacao previa exibe o modal de age gate.
- [ ] Aceite do age gate libera o catalogo e persiste por 30 dias (cookie + localStorage).
- [ ] Rejeicao exibe mensagem de bloqueio e nao carrega produtos.
- [ ] Acesso direto a `/products/[slug]` sem confirmacao exibe age gate antes do produto.
- [ ] Limpar cookies e localStorage reseta o gate corretamente.

### 9.2 Catalogo publico

- [ ] Produtos com status `ACTIVE` aparecem no catalogo.
- [ ] Produtos com status `OUT_OF_STOCK` aparecem com badge "Indisponivel no momento" e CTA desabilitado.
- [ ] Produtos com status `INACTIVE` nao aparecem no catalogo nem na busca.
- [ ] Produtos com `internal=true` nao aparecem no catalogo nem na busca.
- [ ] Filtro por categoria funciona sem recarregar a pagina.
- [ ] Busca por nome retorna resultados relevantes.
- [ ] Busca com mais de 80 caracteres e truncada ou bloqueada na UI.
- [ ] Botao "Carregar mais" funciona e carrega o proximo conjunto de produtos.
- [ ] Layout e legivel em mobile (390x844) e desktop (1280x800).
- [ ] Nenhum dos termos proibidos aparece no catalogo: `comprar`, `carrinho`, `checkout`, `pagamento`, `frete`, `whatsapp`, `finalizar pedido`, `pedido final`.

### 9.3 Pagina de produto (PDP)

- [ ] PDP de produto ACTIVE carrega nome, preco e botao "Tenho interesse".
- [ ] PDP de produto OUT_OF_STOCK mostra "Indisponivel no momento" e nao exibe botao de interesse.
- [ ] PDP de slug inexistente mostra "Produto nao encontrado".
- [ ] Clicar em "Tenho interesse" cria um `OrderDraft` e exibe confirmacao discreta.
- [ ] Falha na API exibe mensagem de erro; botao permanece disponivel para retry.
- [ ] Nenhum dos termos proibidos aparece na PDP.

### 9.4 Admin

- [ ] Acesso a `/admin` sem sessao redireciona para `/admin/signin`.
- [ ] Login com credenciais invalidas exibe erro, sem cookie emitido.
- [ ] Login com credenciais validas redireciona para `/admin`.
- [ ] Dashboard exibe link para `/admin/interests`.
- [ ] Pagina `/admin/interests` carrega e exibe interesses (ou empty state).
- [ ] Pagina `/admin/interests` em mobile (390x844) nao possui overflow horizontal.
- [ ] Logout limpa a sessao e redireciona para `/admin/signin`.
- [ ] Apos logout, `/admin` redireciona novamente para `/admin/signin`.
- [ ] Nenhum dado pessoal de cliente (nome, e-mail, CPF, telefone) e exibido nos interesses.

### 9.5 Seguranca e privacidade

- [ ] Verificar que `/admin` e `/api/admin/*` retornam 401/redirect sem cookie.
- [ ] Verificar que nenhuma rota publica expoe dados de `AdminUser`.
- [ ] Verificar que nenhuma rota publica expoe produtos `internal=true`.
- [ ] Verificar que `ADMIN_AUTH_SECRET` nao aparece em logs nem no bundle publico.
- [ ] Verificar `robots.txt` (ou meta `noindex`) antes de deploy publico.

---

## 10. Checklist de bloqueadores de release

Os itens a seguir sao bloqueadores. O merge em `main` ou deploy em producao nao deve ocorrer sem que sejam resolvidos:

| ID | Bloqueador | Prioridade | Responsavel |
|---|---|---|---|
| B1 | **Ausencia de `robots.txt` ou equivalente.** O painel admin pode ser indexado por buscadores. | Alta | - |
| B2 | **Ausencia de politica de privacidade e aviso de cookies.** Obrigatorio pela LGPD. | Alta | - |
| B3 | **Sem cabecalhos de seguranca HTTP** (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). | Alta | - |
| B4 | **Sem rate limiting** nas APIs `POST /api/order-drafts` e `POST /api/analytics/events`. Abuso pode gerar custo de banco e dados indesejados. | Media | - |
| B5 | **Admin CRUD de produtos ausente.** Gestao do catalogo requer acesso direto ao banco. Decidir antes do lancamento se isso e aceitavel ou se o painel admin precisa de CRUD basico. | Media | - |
| B6 | **Credenciais de admin do seed** (`admin@jofogo.dev` / `Dev@2026!`) **nao devem existir em producao.** Confirmar que o seed de producao cria credenciais unicas e seguras. | Media | - |
| B7 | **HTTPS obrigatorio.** O cookie `admin_session` e HttpOnly mas nao tem flag `Secure` garantida fora de HTTPS. Verificar configuracao de deploy. | Media | - |
| D1 | **Desalinhamento de documentacao legada.** `PRODUCT_SCOPE.md` e `UX_FLOW.md` descrevem o fluxo WhatsApp como parte do MVP, mas o WhatsApp esta fora do escopo da V1. Atualizar esses documentos para refletir o escopo real antes do merge em `main`. | Baixa (docs) | - |

---

## 11. Recomendacoes para rollback e proximos passos

### Rollback

- Branch `main` nao recebe este PR enquanto qualquer bloqueador de nivel Alta permanecer aberto.
- Em caso de regressao apos merge, reverter com `git revert` ou `git reset --hard` para o commit imediatamente anterior ao merge.
- O banco de dados nao tem migracao nova nesta fase, portanto rollback nao requer reversao de schema.

### Proximos passos sugeridos (pos-V1, nao obrigatorios para este release)

| Prioridade | Item |
|---|---|
| P0 | Resolver todos os bloqueadores de release listados acima |
| P1 | Adicionar `robots.txt` (ou `app/robots.ts`) com `Disallow: /admin` |
| P1 | Adicionar pagina de politica de privacidade e aviso de cookies |
| P1 | Configurar cabecalhos HTTP de seguranca em `next.config.mjs` |
| P1 | Atualizar `PRODUCT_SCOPE.md` e `UX_FLOW.md` para marcar WhatsApp como escopo futuro, nao V1 |
| P2 | Rate limiting em APIs publicas de escrita |
| P2 | CRUD basico de produtos no painel admin |
| P2 | Testes automatizados de UI para `CategoryFilter` e `ProductSearch` |
| P3 | Politica de retencao para `OrderDraft` (TTL ou limpeza periodica) |
| P3 | Renovacao automatica de sessao admin |
| P3 | Fluxo WhatsApp (integracao futura, fora do escopo V1) |

---

## 12. Assinatura do auditor

| Campo | Valor |
|---|---|
| Auditado por | Antigravity (AI coding assistant) |
| Revisado por | - (aguardando revisao humana) |
| Data da auditoria | 2026-07-02 |
| Branch auditada | `feature/fase5d-pre-release-audit-draft` |
| Base da auditoria | Fases 4A, 4B, 4C, 4C.1, 5A.1, 5A.2, 5B, 5C, 5C.1, 5D |
| Total de testes validados | 45 (apos Phase 5C.1) |
| Nenhum teste adicionado na Phase 5D | Confirmado |
| Proxima revisao recomendada | Antes do merge em `main` |
