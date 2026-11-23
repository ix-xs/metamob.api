---
title: Conversas
description: "Ler as conversas privadas da conta, marcá-las como lidas e enviar uma mensagem."
sidebar:
  order: 7
---

## Listar as conversas

`conversations.list()` dá uma conversa por correspondente, a mais recente primeiro. É uma [lista](/basics/lists/) de no máximo 50 por página:

```ts
const page = await metamob.conversations.list();

for (const { username, unread_count } of page.items) {
  console.log(username, `${unread_count} unread`);
}

const archived = await metamob.conversations.list({ status: "archived" }).all();
```

Sem `status`, são listadas as conversas ativas.

## Ler uma conversa

`conversations.messages()` dá o que foi trocado com um jogador, do mais recente ao mais antigo. Mensagens e propostas de troca vêm juntas, e `kind` as distingue:

```ts
const latest = await metamob.conversations.messages(username).take(10);

for (const item of latest) {
  if (item.kind === "message") {
    item.content;
    item.sender;
    item.read_at; // null enquanto não foi lida
  }
}
```

Para mostrá-las na ordem de leitura, inverta o array:

```ts
const thread = (await metamob.conversations.messages(username).take(50)).reverse();
```

## Voltar no tempo

As mensagens são paginadas com um cursor: cada página dá o da próxima, para enviar de volta como está. `for await` cuida disso. Manualmente:

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });

if (page.hasNext) {
  const beforeId = page.nextBeforeId;
  const older = await metamob.conversations.messages(username, { limit: 20, beforeId });
}
```

Não há total para as mensagens: `page.total` e `count()` são `undefined`. O número de itens de uma conversa é `message_count`, na lista de conversas.

## Propostas de troca

Uma proposta aparece na conversa como um item cujo `kind` é `"proposal"`. Para todas as propostas da conta, filtradas por estado, missão ou data, veja [Propostas de troca](/resources/trade-proposals/).

```ts
for await (const item of metamob.conversations.messages(username)) {
  if (item.kind !== "proposal") continue;

  console.log(`${item.sender} to ${item.recipient}: ${item.status}`);
  for (const { monster_id, quantity } of item.monsters_given) {
    console.log("  given:", quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Uma proposta designa seus monstros pelo id: [`data.monster()`](/basics/embedded-data/) transforma um id em um monstro sem requisição.

Quando você é o destinatário, você recebe `monsters_given` e dá `monsters_received`. Uma proposta tem aqui os mesmos campos que em [`tradeProposals.list()`](/resources/trade-proposals/), com `kind` a mais.

## Mensagens não lidas

`unread_count` conta o que você recebeu sem ler, propostas incluídas. Dentro de uma conversa, um item não lido tem `read_at` igual a `null`.

```ts
const conversations = await metamob.conversations.list().all();
const waiting = conversations.filter((conversation) => conversation.unread_count > 0);

for (const conversation of waiting) {
  console.log(`${conversation.username}: ${conversation.unread_count} unread`);
}
```

## Marcar como lida

`conversations.markAsRead()` marca como lido tudo o que foi recebido de um jogador, como faz abrir a conversa no site. Ele retorna o número de itens marcados, `0` quando não havia nenhum:

```ts
const { marked_count } = await metamob.conversations.markAsRead(username);
console.log(`${marked_count} marked as read`);
```

## Enviar uma mensagem

`conversations.send()` envia uma mensagem privada de no máximo 1000 caracteres, e a retorna como ela aparece na conversa:

```ts
const text = "Salut, ton Tofu Maléfique est toujours dispo ?";
const message = await metamob.conversations.send(username, text);
console.log(message.id, message.created_at);
```

:::note
O envio fica fechado por padrão: o Metamob o libera conta por conta, a pedido, e sem isso a API responde `FORBIDDEN`. [`features`](/resources/account/#what-the-account-can-do) diz se está liberado. As regras são as do site: também `FORBIDDEN` quando um dos dois jogadores bloqueou o outro, `RATE_LIMITED` além dos limites antispam.
:::

Uma mensagem nunca é tentada de novo, seja qual for a falha: enviada duas vezes, ela chegaria duas vezes. Depois de um tempo esgotado ou de uma falha de rede, leia a conversa antes de enviá-la de novo.

## Limites e erros

- Aplicar, desfazer ou cancelar uma proposta se faz com [`tradeProposals`](/resources/trade-proposals/).
- Uma mensagem vazia, ou com mais de 1000 caracteres, é recusada antes do envio.
- `markAsRead()` responde `NOT_FOUND` para um nome de usuário que não existe.
- Um correspondente pode não ter mais perfil: uma conta excluída mantém suas conversas legíveis por 30 dias, enquanto `users.get()` responde `NOT_FOUND`.
- As conversas pertencem à conta da chave. Nada aqui fica em cache por padrão.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Conversations`](/reference/conversations/) | As mensagens privadas da conta à qual a chave de API pertence. |
| [`Conversation`](/reference/conversation/) | Uma conversa: uma por interlocutor. |
| [`ConversationListParams`](/reference/conversation-list-params/) | Filtros de [`Conversations.list`](/reference/conversations/). |
| [`ConversationMessage`](/reference/conversation-message/) | Uma mensagem de texto de uma conversa. |
| [`MarkAsReadResult`](/reference/mark-as-read-result/) | O que marcar uma conversa como lida retorna. |
| [`MessagesParams`](/reference/messages-params/) | Onde começar a ler uma conversa. |
| [`ConversationItem`](/reference/conversation-item/) | Do que uma conversa é feita. |
<!-- exports:end -->
