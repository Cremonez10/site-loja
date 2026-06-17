# JoFogo V1 - Escopo do Produto

## Visão geral
JoFogo é uma loja de produtos sensuais/adultos com foco em catálogo próprio, navegação discreta e mobile-first. A V1 entrega uma vitrine protegida por confirmação 18+, produtos categorizados, busca suave, páginas de produto discretas, mini-pedido de intenção e envio assistido via WhatsApp com fallback de cópia de mensagem.

## Escopo da V1
- Experiência mobile-first e discreta para o cliente.
- Página de entrada com confirmação 18+ antes de visualizar produtos.
- Catálogo de produtos com filtros por categoria.
- Busca interna simples por nome de produto e tags discretas.
- Página de produto com imagens e descrição discreta.
- Mini-pedido que representa intenção de compra, não pagamento.
- Envio assistido para WhatsApp com mensagem pré-formatada.
- Fallback de copiar mensagem se WhatsApp não abrir.
- Painel de administração para gestão de produtos e categorias.
- Produto pode pertencer a múltiplas categorias.
- Produto interno marcado como noindex na V1.
- Produto deve ter status `ACTIVE`, `OUT_OF_STOCK` ou `INACTIVE`.
- Admin protegido por autenticação.

## Fora do escopo
- Não implementar checkout online.
- Não implementar marketplace.
- Não implementar login de cliente.
- Não implementar IA ou recomendações baseadas em IA.
- Não exibir, buscar ou renderizar produtos antes do aceite 18+.
- Não realizar pagamento, processamento de cartão ou métodos de pagamento.
- Não expor produto interno em buscas públicas.

## Regras de negócio essenciais
- O cliente só vê produtos após confirmar 18+.
- `mini-pedido` é uma intenção de compra, não um pedido pago.
- O botão de WhatsApp deve oferecer fallback de cópia de mensagem.
- Produtos com status `OUT_OF_STOCK` devem aparecer como indisponíveis.
- Produtos `INACTIVE` não devem ser mostrados na vitrine ou na busca.
- Produtos internos têm flag `internal` e devem ser noindex.
- Um produto pode pertencer a várias categorias ao mesmo tempo.

## Critérios de aceite
- [ ] A vitrine só é acessível após confirmação 18+.
- [ ] Produtos ativos aparecem em categorias e resultados de busca.
- [ ] Produtos esgotados aparecem com indicação clara.
- [ ] Mini-pedido inicia intenção de compra sem pagamento.
- [ ] WhatsApp abre quando disponível e oferece copiar mensagem como fallback.
- [ ] Admin só acessível com autenticação.
- [ ] Produto interno não é indexado nem listado publicamente.

## Riscos técnicos
- Falha no bloqueio 18+ pode expor conteúdo antes do aceite.
- Integração com WhatsApp depende do ambiente do cliente.
- Gestão de status e visibilidade de produto precisa ser confiável.

## Riscos de privacidade
- Dados de intenção devem ser mínimos e temporários.
- Não coletar login de cliente ou perfil pessoal na V1.
- Mensagens de envio não podem expor informações sensíveis.
