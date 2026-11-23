---
title: Propostas de troca
description: "Ler as propostas de troca enviadas e recebidas, e enviar uma."
sidebar:
  order: 8
---

Uma proposta de troca vai de uma das suas missões para outro jogador. A API permite lê-las, aplicar o seu lado, desfazê-lo ou cancelá-las, e enviá-las quando o envio está liberado na conta. Cada uma também aparece na [conversa](/resources/conversations/#trade-proposals) com esse jogador.

## Listar as propostas

`tradeProposals.list()` dá as propostas da conta, a mais recente primeiro. É uma [lista](/basics/lists/) de no máximo 50 por página, paginada com um cursor como as mensagens:

```ts
const pending = { direction: "received", status: "pending" } as const;

const waiting = await metamob.tradeProposals.list(pending).all();
const sent = await metamob.tradeProposals.list({ direction: "sent" }).take(20);
const done = await metamob.tradeProposals.list({ quest: slug, status: "completed" });
const going = await metamob.tradeProposals.list({ status: "open" });
```

| Filtro | Valores |
| --- | --- |
| `direction` | `"received"`: feitas para você. `"sent"`: feitas por você. `"all"`, o padrão: as duas |
| `status` | `"pending"`, `"half_applied"`, `"completed"`, `"cancelled"`, ou `"open"` para as que ainda estão em andamento: `pending` e `half_applied` |
| `quest` | O slug de uma das suas missões |
| `since` | Uma `Date`, ou uma data ISO 8601 com fuso horário como `"2026-01-27T14:00:00Z"`: só as propostas criadas a partir desse momento, inclusive |

Uma data sem fuso horário, ou uma que a API não conseguiria ler, é recusada antes de qualquer requisição.

## Quem dá o quê

`monsters_given` é o que o remetente dá, `monsters_received` o que o remetente recebe. Quando você é o destinatário, leia ao contrário: você recebe `monsters_given` e dá `monsters_received`.

```ts
const me = await metamob.me();

for await (const proposal of metamob.tradeProposals.list({ status: "pending" })) {
  const mine = proposal.recipient === me.username;
  const incoming = mine ? proposal.monsters_given : proposal.monsters_received;

  for (const { monster_id, quantity } of incoming) {
    console.log(proposal.id, quantity, data.monster(monster_id)?.name.fr);
  }
}
```

Uma proposta designa seus monstros pelo id: [`data.monster()`](/basics/embedded-data/) transforma um id em um monstro sem requisição.

| `status` | Significado |
| --- | --- |
| `pending` | Ninguém aplicou o seu lado ainda |
| `half_applied` | Um dos dois jogadores aplicou o seu lado: veja `applications` |
| `completed` | Os dois lados estão aplicados |
| `cancelled` | Cancelada por `cancelled_by`, ou expirada quando `cancelled_by` é `null` |

Uma proposta `pending` traz `expires_at`, o momento em que ela será cancelada sozinha: quando ninguém aplicou o seu lado depois de 30 dias, ela passa a `cancelled`, sem `cancelled_by`. O horário é aproximado, o cancelamento roda uma vez por dia. Em todos os outros estados, `expires_at` é `null`.

## Ler uma proposta

`tradeProposals.get()` recebe um id, ou uma proposta tirada de uma lista. A resposta adiciona `viewer`, o seu lado da proposta: o seu papel, se você aplicou o seu lado e até quando pode desfazê-lo (`unapply_until`), o que sai da sua missão (`removed`) e o que entra nela (`added`).

```ts
const proposal = await metamob.tradeProposals.get(57);

proposal.viewer.role; // "sender" ou "recipient"
proposal.viewer.applied; // você aplicou o seu lado

for (const { monster_id, owned, quantity } of proposal.viewer.added) {
  const name = data.monster(monster_id)?.name.fr;
  console.log(name, `${owned ?? 0} owned, ${quantity} coming`);
}
```

Cada monstro de `removed` e `added` traz `owned`: o número de cópias dele que você possui agora. Depois que o seu lado é aplicado, ele já o inclui. Ele é `null` quando você não tem missão desse tipo nesse servidor.

`create()`, `apply()`, `unapply()` e `cancel()` respondem com a proposta no mesmo formato.

## Fazer uma proposta

`tradeProposals.create()` envia uma proposta a partir de uma das suas missões. Os campos dela têm os mesmos nomes que na leitura: `recipient`, `sender_quest`, `recipient_quest`, `monsters_given` e `monsters_received`. Os monstros são escritos como em [`quests.setMonsters()`](/resources/quests/#recording-many-monsters), pelo id ou pelo nome:

```ts
// Um parceiro e a missão dele, como matches() os encontra.
const match = await metamob.quests.matches(slug).first();

if (match) {
  const proposal = await metamob.tradeProposals.create({
    recipient: match.user.username,
    sender_quest: slug,
    recipient_quest: match.quest.slug,
    monsters_given: { "Tofu Maléfique": 1 },
    monsters_received: { "Bouftou Royal": 1 },
  });
  console.log(proposal.id, proposal.status); // "pending"
}
```

`recipient`, `sender_quest` e `recipient_quest` são obrigatórios. `recipient_quest` é o slug da missão do outro jogador, que `quests.matches()` dá para cada parceiro. As duas missões devem ser do mesmo tipo e do mesmo servidor. É preciso pelo menos um monstro, de um lado ou do outro, e no máximo 200 de cada lado.

:::note
O envio fica fechado por padrão: o Metamob o libera conta por conta, a pedido, e sem isso a API responde `FORBIDDEN`. [`features`](/resources/account/#what-the-account-can-do) diz se está liberado. As regras são as do site: `FORBIDDEN` quando um dos dois jogadores bloqueou o outro, `RATE_LIMITED` além dos limites antispam.
:::

Uma proposta nunca é tentada de novo, seja qual for a falha: enviada duas vezes, ela existiria duas vezes. Depois de um tempo esgotado ou de uma falha de rede, olhe `list({ direction: "sent" })` antes de enviá-la de novo.

## Aplicar uma proposta

`tradeProposals.apply()` aplica o seu lado da proposta à sua missão: o que você dá sai dela, o que você recebe entra nela. Funciona para o remetente e para o destinatário, e a proposta passa a `completed` quando os dois lados estão aplicados. Ao contrário do envio, está liberado para todas as chaves:

```ts
const proposal = await metamob.tradeProposals.apply(57);

proposal.status; // "half_applied", ou "completed" se o outro lado já estava aplicado
proposal.viewer.applied; // true
```

Quando faltam cópias de um monstro que você dá, nada muda e a API responde `CONFLICT`, com o que você possui e o que é pedido. Com `allowPartial: true`, a proposta é aplicada mesmo assim, cada quantidade reduzida ao que você possui: `viewer.clamped` é então `true`, e `applied_quantity` dá o que realmente se moveu para cada monstro. `clamped` também é `true` quando um monstro que você recebe ultrapassaria a quantidade máxima.

```ts
const proposal = await metamob.tradeProposals.apply(57, { allowPartial: true });
const { clamped, removed } = proposal.viewer;

if (clamped) {
  for (const { monster_id, quantity, applied_quantity } of removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // o que realmente se moveu
  }
}
```

Aplicar duas vezes, ou aplicar uma proposta cancelada, também responde `CONFLICT`. `apply()` nunca é tentado de novo: depois de um tempo esgotado, leia a proposta de novo com `get()` antes de tentar de novo.

## Desfazer a sua aplicação

Durante 2 horas depois de você aplicar o seu lado, `tradeProposals.unapply()` o desfaz: o que você deu volta para a sua missão, o que você recebeu sai dela, nas quantidades que realmente se moveram. O outro jogador não é alterado nem avisado. `viewer.unapply_until` dá o prazo, e é `null` quando não há nada a desfazer:

```ts
const proposal = await metamob.tradeProposals.get(57);

if (proposal.viewer.unapply_until) {
  const undone = await metamob.tradeProposals.unapply(proposal);

  for (const { monster_id, quantity, applied_quantity } of undone.viewer.removed) {
    const name = data.monster(monster_id)?.name.fr;
    console.log(name, `${applied_quantity} of ${quantity}`); // o que voltou para a sua missão
  }
}
```

A resposta é a proposta, com `viewer.applied` de volta a `false`. Quando você mudou as suas quantidades nesse meio tempo, o desfazer pode ser parcial: um monstro que você recebeu e já usou, ou a quantidade máxima atingida. `viewer.clamped` é então `true`, e `applied_quantity` diz o que realmente se moveu.

Funciona mesmo quando a proposta foi cancelada desde então. Caso contrário, você pode depois aplicá-la de novo, ou cancelá-la. Depois do prazo, em uma proposta que você não aplicou, ou em uma aplicada antes de o Metamob adicionar isso, a API responde `CONFLICT`: corrija então as suas quantidades manualmente. Como `apply()`, `unapply()` nunca é tentado de novo.

## Cancelar ou recusar

`tradeProposals.cancel()` cancela uma proposta que você enviou, ou recusa uma que você recebeu. Funciona enquanto você não aplicou o seu lado, mesmo quando o outro jogador aplicou o dele:

```ts
const proposal = await metamob.tradeProposals.cancel(57);

proposal.status; // "cancelled"
```

Uma proposta já cancelada, ou já aplicada por você, responde `CONFLICT`. Como `apply()`, `cancel()` nunca é tentado de novo.

## Acompanhar as novas propostas

Consultada regularmente com `since`, a lista dá o que chegou desde a última vez, por exemplo para um bot que avisa você:

```ts
let lastCheck = new Date();

setInterval(async () => {
  const since = lastCheck;
  lastCheck = new Date();

  const fresh = await metamob.tradeProposals
    .list({ direction: "received", since })
    .all();
  for (const proposal of fresh) console.log(`New proposal from ${proposal.sender}`);
}, 5 * 60_000);
```

`read_at` continua `null` até o destinatário abrir a proposta no site.

## Limites e erros

- `apply()`, `unapply()` e `cancel()` respondem `NOT_FOUND` para uma proposta que não existe ou da qual você não participa, e `CONFLICT` para uma proposta já cancelada, já aplicada por você, ou cuja missão sua foi excluída.
- `create()` recusa antes do envio uma proposta sem nenhum monstro, uma quantidade fora de 1 a 99, um monstro citado duas vezes do mesmo lado, ou mais de 200 monstros de um lado.
- A API responde `BAD_REQUEST` para um monstro que não está na missão, para um monstro do qual você dá mais cópias do que possui, ou para duas missões de tipos ou servidores diferentes, e `NOT_FOUND` para uma missão que não existe ou, no caso de `sender_quest`, que não é sua.
- `NOT_FOUND` para uma proposta que não existe ou que não é sua.
- `BAD_REQUEST` para um `quest` que não é uma das suas missões, e para um `direction` ou um `status` que a API não conhece.
- Um id, uma missão ou uma data inválidos são recusados antes do envio.
- As propostas pertencem à conta da chave. Nada aqui fica em cache por padrão.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`TradeProposals`](/reference/trade-proposals/) | As propostas de troca da conta: as que você enviou e as que você recebeu, em todas as missões. |
| [`ApplyProposalOptions`](/reference/apply-proposal-options/) | Opções de [`TradeProposals.apply`](/reference/trade-proposals/). |
| [`ConversationProposal`](/reference/conversation-proposal/) | Uma proposta de troca como aparece em uma conversa, entre as mensagens. |
| [`NewTradeProposal`](/reference/new-trade-proposal/) | O que [`TradeProposals.create`](/reference/trade-proposals/) envia. |
| [`ProposalMonster`](/reference/proposal-monster/) | Uma quantidade de um monstro em uma proposta de troca. |
| [`ProposalMonsterDetail`](/reference/proposal-monster-detail/) | Um monstro que sai da sua missão ou entra nela com uma proposta de troca, com o que você possui dele agora. |
| [`ProposalQuest`](/reference/proposal-quest/) | A missão de um lado de uma proposta de troca. |
| [`ProposalQuestTemplate`](/reference/proposal-quest-template/) | O modelo de missão de uma proposta de troca: qual tipo de missão, em qual versão do jogo. |
| [`ProposalViewer`](/reference/proposal-viewer/) | O seu lado de uma proposta de troca. |
| [`TradeProposal`](/reference/trade-proposal/) | Uma proposta de troca entre dois jogadores. |
| [`TradeProposalDetail`](/reference/trade-proposal-detail/) | Uma proposta de troca lida isoladamente, com o seu lado dela. |
| [`TradeProposalListParams`](/reference/trade-proposal-list-params/) | Filtros de [`TradeProposals.list`](/reference/trade-proposals/). |
<!-- exports:end -->
