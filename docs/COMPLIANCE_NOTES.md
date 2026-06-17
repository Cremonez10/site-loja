# JoFogo V1 - Notas de Compliance

## Objetivo
Garantir que a V1 seja discreta, segura e compatível com requisitos de privacidade e conteúdo adulto.

## Controle de acesso 18+
- Exigir confirmação 18+ antes de carregar qualquer produto.
- Não exibir, buscar ou renderizar produtos antes do aceite.
- Usar linguagem suave e discreta no gate de acesso.

## Privacidade dos usuários
- Não implementar login de cliente na V1.
- Não armazenar informações pessoais do cliente para navegação.
- Minimizar qualquer dado coletado em mini-pedidos.
- Não usar IA para processamento de dados de clientes.

## Conteúdo e indexação
- Produtos internos devem ser marcados como `internal` e `noindex`.
- O site deve usar `robots` ou metadados apropriados para produtos internos.
- Evitar conteúdo explícito nas descrições e imagens de V1.

## Mensagens e WhatsApp
- Mensagem do mini-pedido deve ser discreta e sem dados sensíveis.
- Oferecer fallback de cópia caso WhatsApp não abra.
- Não tratar mini-pedido como pagamento ou confirmação de compra.

## Admin e segurança
- O painel admin deve ser protegido por autenticação robusta.
- Não expor rotas administrativas sem login.
- Registrar acessos e alterações de produtos se possível.

## Riscos de privacidade
- Exposição antecipada de produtos sem consentimento 18+.
- Armazenamento indevido de dados de intenção de compra.
- Uso de analytics que capturem dados pessoais sem controle.
- Falha no noindex de produtos internos.

## Recomendações
- Limitar analytics a eventos de produto e mini-pedido, sem PII.
- Revisar regras de visibilidade antes do lançamento.
- Verificar que o admin não está indexado por mecanismos de busca.
- Aplicar políticas de cookies e consentimento quando necessário.
