# JoFogo V1 - Fluxo de UX

## Fluxo do cliente
1. Usuário chega ao site.
2. Exibe modal discreto de confirmação 18+ com texto suave.
3. Se o usuário aceita, habilita o acesso ao catálogo.
4. O usuário navega por categorias e busca por termos discretos.
5. Clica em um produto para ver a página de detalhe.
6. Na página do produto, vê descrição, preço e disponibilidade.
7. Se quiser comprar, inicia mini-pedido de intenção de compra.
8. O site gera uma mensagem pronta para envio por WhatsApp.
9. O cliente escolhe abrir WhatsApp ou copiar a mensagem como fallback.

### Comportamento mobile-first
- Layout responsivo e leitura fácil em telas pequenas.
- Navegação por categorias em formato de lista compacta.
- Botão de ação fixo para mini-pedido.
- Conteúdo discreto e sem linguagem explícita.

## Fluxo do lojista/admin
1. Lojista acessa `/admin` ou rota protegida.
2. Inicia sessão com autenticação segura.
3. Visualiza painel de produtos e categorias.
4. Cria e edita categorias com nome e descrição discreta.
5. Cria e edita produtos com título, descrição, preço, imagens e status.
6. Define categorias múltiplas para cada produto.
7. Marca produtos internos como `internal` para noindex.
8. Atualiza status para `ACTIVE`, `OUT_OF_STOCK` ou `INACTIVE`.

## Fluxos adicionais - Fase 4B

- Age Gate:
	- Ao acessar `/`, exibir modal discreto solicitando confirmação 18+.
	- Ao aceitar, gravar confirmação por 30 dias (cookie + localStorage) e liberar conteúdo institucional.
	- Ao negar, não liberar conteúdo e exibir mensagem discreta.

- Login / Logout Admin:
	- `/admin` e `/api/admin/*` são protegidos por sessão assinada em cookie `admin_session`.
	- `/admin/signin` e as rotas `/api/admin/auth/signin` e `/api/admin/auth/signout` são públicas.
	- Após login bem-sucedido o admin é redirecionado para `/admin`.
	- O logout limpa o cookie e retorna para `/admin/signin`.

## Regras de negócio no fluxo
- Usuário não deve ver produtos antes do aceite 18+.
- A busca deve responder apenas a produtos com status `ACTIVE` ou `OUT_OF_STOCK`.
- Produtos `INACTIVE` não aparecem no catálogo nem na busca.
- Mini-pedido não cria pedido pago nem processo de checkout.
- Admin deve manter acesso protegido e auditável.

## Critérios de aceite do fluxo
- [ ] A confirmação 18+ aparece antes de qualquer produto.
- [ ] A navegação por categoria funciona em dispositivos móveis.
- [ ] A pesquisa retorna resultados discretos de forma consistente.
- [ ] O mini-pedido encaminha corretamente para WhatsApp.
- [ ] O fallback de copiar mensagem funciona quando WhatsApp não pode ser aberto.
- [ ] O admin apresenta controles de gestão de produto e categoria.

## Observações de usabilidade
- Use rótulos discretos como “Descubra” em vez de “Adulto”.
- Mantenha o design limpo e com cores sóbrias.
- Evite imagens explícitas na V1; use fotos de ambiente ou close suave.
- Ofereça confirmação clara de envio do mini-pedido.
