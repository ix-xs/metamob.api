---
title: Conta
description: "metamob.me() diz a qual conta uma chave de API pertence."
sidebar:
  order: 1
---

## O que é retornado

`metamob.me()` retorna o nome de usuário, a bio, o avatar e a última atividade da conta da chave, e o que o Metamob liberou para ela. Nada privado: é o que o perfil público mostra, sem as missões.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // o avatar é um monstro
  console.log(urls.monsterImage(me.avatar)); // a imagem dele
}
```

## O que a conta pode fazer

O envio de mensagens e de propostas de troca é liberado pelo Metamob conta por conta, a pedido. `features` diz o que está liberado, para mostrar ou esconder o envio no seu aplicativo sem tentar a chamada:

```ts
const { features } = await metamob.me();

if (features.trade_proposals_create) {
  // mostrar o botão que envia uma proposta
}
```

| Campo | `true` quando esta chamada está liberada |
| --- | --- |
| `messages_send` | `conversations.send()` |
| `trade_proposals_create` | `tradeProposals.create()` |

Em uma conta onde ele é `false`, a chamada responde `FORBIDDEN`. Outros campos podem surgir: ignore os que você não conhece.

## De uma chave a todo o resto

Os endpoints públicos precisam de um nome de usuário, que `me()` fornece:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // como os outros o veem
console.log(`${profile.quests.length} public quests`);
```

As missões da conta, incluindo as ocultas, estão em [`metamob.quests`](/resources/quests/). O perfil e as missões públicas de qualquer jogador estão em [`metamob.users`](/resources/users/).

## Validar uma chave

`me()` é a chamada mais leve que exige uma chave válida: é o teste certo quando um jogador dá a chave dele a você.

```ts
async function whose(key: string) {
  try {
    return (await metamob.withKey(key).me()).username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined;
    throw error;
  }
}
```

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Account`](/reference/account/) | A conta à qual uma chave de API pertence. |
| [`AccountFeatures`](/reference/account-features/) | O que o Metamob liberou para uma conta mediante pedido: `true` quando o endpoint responde, `false` quando responderia `FORBIDDEN`. |
| [`Avatar`](/reference/avatar/) | O monstro que um usuário escolheu como avatar. |
| [`UserSummary`](/reference/user-summary/) | Um usuário como uma busca ou uma correspondência de troca o retorna. |
<!-- exports:end -->
