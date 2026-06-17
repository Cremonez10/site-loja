# Copilot Instructions for JoFogo

## Project context
JoFogo é uma loja de produtos sensuais/adultos. A V1 é um catálogo mobile-first e discreto com confirmação 18+, categorias, busca, página de produto, mini-pedido, envio assistido via WhatsApp, fallback de copiar mensagem e painel admin protegido por autenticação.

## Regras obrigatórias para implementações
- Não implementar checkout online.
- Não implementar marketplace.
- Não implementar login de cliente.
- Não implementar IA.
- Não exibir, buscar ou renderizar produtos antes do aceite 18+.
- Produto deve ter status `ACTIVE`, `OUT_OF_STOCK` ou `INACTIVE`.
- Produto pode pertencer a múltiplas categorias.
- Mini-pedido representa intenção de compra, não pedido pago.
- WhatsApp deve ter fallback de copiar mensagem.
- Produto interno deve ser `noindex` na V1.
- Admin deve ser protegido por autenticação.
- Usar TypeScript strict.
- Usar Next.js App Router.
- Separar regras de negócio em `lib/services`.
- Separar validações em `lib/validators`.
- Separar formatações em `lib/formatters`.
- Separar analytics em `lib/analytics`.
- Evitar lógica complexa em componentes React.
- Todo fluxo crítico deve tratar erro.
- Toda ação relevante deve registrar evento analítico.
- Antes de alterar muitos arquivos, explique o plano e liste os arquivos afetados.

## Notas importantes
- Use linguagem discreta e tom suave.
- Priorize mobile-first e privacidade.
- Admin é apenas para gestão de catálogo e categorias.
- Gestão de produto interno deve ser possível sem exposição pública.
