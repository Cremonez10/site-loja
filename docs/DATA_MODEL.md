# JoFogo V1 - Modelo de Dados Inicial

## Entidades principais

### Product
- `id`: UUID
- `sku`: string (único)
- `name`: string
- `slug`: string (único)
- `description`: string
- `price`: Decimal
- `status`: enum [`ACTIVE`, `OUT_OF_STOCK`, `INACTIVE`]
- `brandId`: UUID opcional
- `categories`: relação muitos-para-muitos com `ProductCategory`
- `images`: relação com `ProductImage`
- `attributes`: relação com `ProductAttribute`
- `internal`: boolean
- `noindex`: boolean (true quando `internal` é true)
- `createdAt`: datetime
- `updatedAt`: datetime

### Category
- `id`: UUID
- `name`: string
- `slug`: string
- `description`: string
- `createdAt`: datetime
- `updatedAt`: datetime

### ProductCategory
- `id`: UUID
- `productId`: UUID
- `categoryId`: UUID
- `createdAt`: datetime

### ProductImage
- `id`: UUID
- `productId`: UUID
- `url`: string
- `altText`: string
- `position`: integer
- `createdAt`: datetime

### ProductAttribute
- `id`: UUID
- `productId`: UUID
- `name`: string
- `value`: string
- `createdAt`: datetime

### Brand
- `id`: UUID
- `name`: string
- `slug`: string
- `description`: string opcional
- `createdAt`: datetime
- `updatedAt`: datetime

### OrderDraft
- `id`: UUID
- `createdAt`: datetime
- `updatedAt`: datetime
- `status`: enum [`INTENT_CREATED`, `SENT_TO_WHATSAPP`, `COPIED_TO_CLIPBOARD`]
- `items`: relação com `OrderItem`
- `notes`: string opcional

### OrderItem
- `id`: UUID
- `orderDraftId`: UUID
- `productId`: UUID
- `productName`: string
- `quantity`: integer
- `priceSnapshot`: Decimal
- `createdAt`: datetime
- `updatedAt`: datetime

### AnalyticsEvent
- `id`: UUID
- `name`: string
- `timestamp`: datetime
- `productId`: UUID opcional
- `categoryId`: UUID opcional
- `adminId`: UUID opcional
- `metadata`: JSON

### AdminUser
- `id`: UUID
- `email`: string
- `name`: string
- `passwordHash`: string
- `role`: string
- `lastLoginAt`: datetime opcional
- `createdAt`: datetime
- `updatedAt`: datetime

## Relacionamentos
- `Product` ↔ `Category`: muitos-para-muitos via `ProductCategory`.
- `Product` ↔ `ProductImage`: um para muitos.
- `Product` ↔ `ProductAttribute`: um para muitos.
- `Product` ↔ `Brand`: muitos produtos podem pertencer a uma marca.
- `OrderDraft` ↔ `OrderItem`: um para muitos.
- `OrderItem` salva `priceSnapshot` para preservar o valor atual do produto no momento da intenção.
- `AnalyticsEvent` é genérico e armazena `metadata` em JSON.

## Observações de modelo
- `Product.sku` e `Product.slug` são únicos.
- `Product.price` deve usar tipo Decimal para evitar imprecisão em valores monetários.
- `Product` pode ter múltiplas categorias e várias imagens.
- Atributos dinâmicos de produto são permitidos via `ProductAttribute`.
- `OrderDraft` representa intenção de compra, não um pedido pago.
- `OrderItem.priceSnapshot` mantém o preço no momento da intenção.
- Não criar entidades `Customer`, `Payment` ou `Checkout` na V1.

## Regras de negócio aplicadas ao modelo
- Produtos com `status = ACTIVE` aparecem no catálogo e na busca.
- Produtos com `status = OUT_OF_STOCK` aparecem como indisponíveis e não podem ser adicionados ao mini-pedido.
- Produtos com `status = INACTIVE` não aparecem publicamente.
- Produtos internos são marcados `internal` e devem ser `noindex`.
- O admin deve autenticar para criar, editar ou alterar status de produtos.
- Eventos analíticos são gravados com `AnalyticsEvent.metadata` JSON para detalhes adicionais.
