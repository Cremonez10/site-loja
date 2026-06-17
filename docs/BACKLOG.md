# JoFogo V1 - Backlog Técnico

## Histórias P0

### 1. Age gate bloqueia catálogo
- Prioridade: P0
- Esforço: 3
- Dependência: Nenhuma
- Dado: que o usuário chegou ao site
- Quando: a página de confirmação 18+ é exibida
- Então: o catálogo não deve ser buscado ou renderizado antes do aceite
- Fora do escopo: permitir visualização parcial do catálogo antes do aceite

### 2. Catálogo lista produtos ativos
- Prioridade: P0
- Esforço: 5
- Dependência: age gate aceito
- Dado: que existem produtos com status `ACTIVE`
- Quando: o usuário acessa o catálogo após o aceite 18+
- Então: apenas produtos com status `ACTIVE` ou `OUT_OF_STOCK` são exibidos
- Fora do escopo: exibir produtos `INACTIVE`

### 3. Produto esgotado aparece sem permitir adicionar
- Prioridade: P0
- Esforço: 3
- Dependência: catálogo funcional
- Dado: que um produto tem status `OUT_OF_STOCK`
- Quando: o usuário visualiza o produto
- Então: o produto aparece como indisponível e não pode ser adicionado ao mini-pedido
- Fora do escopo: permitir reserva ou pré-venda

### 4. Produto inativo não aparece
- Prioridade: P0
- Esforço: 2
- Dependência: catálogo funcional
- Dado: que um produto tem status `INACTIVE`
- Quando: o usuário busca ou navega por categorias
- Então: o produto não deve aparecer em resultados ou listagens
- Fora do escopo: listar produto inativo no catálogo público

### 5. Busca retorna produtos permitidos
- Prioridade: P0
- Esforço: 4
- Dependência: catálogo e produto ativo
- Dado: que há produtos ativos e esgotados
- Quando: o usuário pesquisa por um termo válido
- Então: a busca retorna apenas produtos permitidos e ocultas `INACTIVE`
- Fora do escopo: realizar busca com conteúdo explícito antes do aceite

### 6. PDP mostra produto ativo
- Prioridade: P0
- Esforço: 4
- Dependência: catálogo funcional
- Dado: que o usuário selecionou um produto `ACTIVE`
- Quando: ele abre a página de produto
- Então: a PDP mostra nome, descrição discreta, preço, imagens e status
- Fora do escopo: checkout ou compra direta

### 7. Mini-pedido adiciona/remove/altera quantidade
- Prioridade: P0
- Esforço: 5
- Dependência: PDP e localStorage
- Dado: que o usuário está na página do produto
- Quando: ele adiciona, remove ou altera a quantidade
- Então: o mini-pedido local atualiza corretamente e mantém intenção sem pagamento
- Fora do escopo: criar pedido pago ou processar pagamento

### 8. WhatsApp gera mensagem encoded
- Prioridade: P0
- Esforço: 3
- Dependência: mini-pedido funcional
- Dado: que o usuário ativou o envio para WhatsApp
- Quando: a ação é acionada
- Então: a mensagem deve ser codificada e pronta para envio no WhatsApp
- Fora do escopo: enviar automaticamente sem consentimento do usuário

### 9. Fallback copia mensagem
- Prioridade: P0
- Esforço: 2
- Dependência: fluxo WhatsApp implementado
- Dado: que o WhatsApp não pode ser aberto
- Quando: o usuário escolhe copiar a mensagem
- Então: a mensagem deve ser copiada para a área de transferência
- Fora do escopo: armazenar mensagem no servidor sem ação do usuário

### 10. Admin autentica
- Prioridade: P0
- Esforço: 4
- Dependência: backend de auth e middleware
- Dado: que o admin acessa `/admin`
- Quando: ele fornece credenciais válidas
- Então: ele recebe sessão segura com cookie HttpOnly e acessa o painel
- Fora do escopo: login de cliente ou autenticação social

### 11. Admin cria/edita produto
- Prioridade: P0
- Esforço: 5
- Dependência: admin autenticado
- Dado: que o admin está no painel
- Quando: ele cria ou edita um produto
- Então: o produto é salvo com sku, slug únicos, categorias e imagens
- Fora do escopo: publicar em marketplace ou lista pública sem controle

### 12. Admin altera status do produto
- Prioridade: P0
- Esforço: 3
- Dependência: admin autenticado
- Dado: que o admin edita um produto
- Quando: ele altera o status do produto
- Então: o novo status é refletido no catálogo e na busca conforme regras
- Fora do escopo: permitir alteração de status por cliente

## Critérios de aceite gerais
- Todas as histórias críticas devem ter fluxo claro e testes Playwright planejados.
- O site deve manter linguagem discreta e foco mobile-first.
- Nenhum item de checkout, marketplace, login de cliente ou IA deve ser implementado.
