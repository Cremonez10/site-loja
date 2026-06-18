# JoFogo V1 - Eventos Analíticos

## Objetivo
Registrar eventos padronizados que capturem navegação, engajamento e fluxo de mini-pedido sem coletar dados pessoais sensíveis.

## Eventos padronizados

- `age_gate_viewed`
  - Quando a página de confirmação 18+ é exibida.
  - Propriedades: `timestamp`.

- `age_gate_accepted`
  - Quando o visitante confirma 18+.
  - Propriedades: `timestamp`.

- `age_gate_rejected`
  - Quando o visitante rejeita o gate 18+.
  - Propriedades: `timestamp`.

- `catalog_viewed`
  - Quando o visitante acessa o catálogo.
  - Propriedades: `category`, `query`, `resultsCount`.

- `category_viewed`
  - Quando o visitante abre uma categoria específica.
  - Propriedades: `categoryId`, `categoryName`, `resultsCount`.

- `search_performed`
  - Quando o visitante realiza uma busca.
  - Propriedades: `query`, `resultsCount`.

- `product_viewed`
  - Quando o visitante visualiza a página de produto.
  - Propriedades: `productId`, `productName`, `status`.

- `product_added_to_order`
  - Quando um item é adicionado ao mini-pedido.
  - Propriedades: `productId`, `productName`, `quantity`, `price`.

- `product_removed_from_order`
  - Quando um item é removido do mini-pedido.
  - Propriedades: `productId`, `productName`, `quantity`.

- `order_quantity_changed`
  - Quando a quantidade de um item no mini-pedido é alterada.
  - Propriedades: `productId`, `productName`, `quantity`, `price`.

- `order_intent_started`
  - Quando o mini-pedido é iniciado.
  - Propriedades: `orderDraftId`, `itemsCount`, `totalValue`.

- `order_intent_sent`
  - Quando a intenção é enviada para WhatsApp.
  - Propriedades: `orderDraftId`, `itemsCount`, `totalValue`.

- `whatsapp_message_copied`
  - Quando o usuário copia a mensagem do mini-pedido.
  - Propriedades: `orderDraftId`, `itemsCount`, `totalValue`.

- `admin_login_success`
  - Quando um admin autentica com sucesso.
  - Propriedades: `adminId`, `email`.

- `admin_product_created`
  - Quando um produto é criado no painel admin.
  - Propriedades: `adminId`, `productId`, `productName`.

- `admin_product_updated`
  - Quando um produto é atualizado no painel admin.
  - Propriedades: `adminId`, `productId`, `productName`.

- `admin_product_status_changed`
  - Quando o status de um produto é alterado.
  - Propriedades: `adminId`, `productId`, `oldStatus`, `newStatus`.

## Observações
- Todos os eventos devem usar `AnalyticsEvent.metadata` em JSON para detalhes extras.
- Não enviar dados pessoais do visitante.
- Evitar armazenamento de IP ou identificadores persistentes além do necessário.
- O evento `admin_login_success` deve ser usado apenas para auditoria do painel.
- O endpoint `POST /api/analytics/events` aceita apenas nomes de evento documentados e rejeita metadados que contenham PII em qualquer nível de profundidade.
- O endpoint bloqueia chaves de PII como `email`, `phone`, `whatsapp`, `cpf`, `document`, `password` ou `address` em qualquer objeto aninhado.
- Rate limiting para eventos é uma preocupação futura de infraestrutura e deve ser tratado no backlog sem ser implementado nesta fase.

## Eventos recomendados para a Fase 4C
- `age_gate_viewed`
- `age_gate_accepted`
- `age_gate_rejected`
- `catalog_viewed`
- `category_viewed`
- `search_performed`
- `product_viewed`
- `product_added_to_order`
- `order_intent_started`
- `order_intent_sent`
- `whatsapp_message_copied`
- `admin_login_success`
- `admin_product_created`
- `admin_product_updated`
- `admin_product_status_changed`

## Critérios de análise
- Monitorar o fluxo do age gate e a aceitação/rejeição.
- Avaliar conversão de `order_intent_started` para `order_intent_sent`.
- Medir uso do fallback `whatsapp_message_copied`.
- Acompanhar eventos admin de criação, atualização e mudança de status.
