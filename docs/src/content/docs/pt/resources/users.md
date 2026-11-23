---
title: Outros jogadores
description: "Pesquisar jogadores, ler um perfil público e os monstros de uma missão pública."
sidebar:
  order: 6
---

## Pesquisar jogadores

`users.search()` procura uma parte do nome de usuário, a partir de 3 caracteres, entre os jogadores que têm pelo menos uma missão pública. É uma [lista](/basics/lists/) de no máximo 50 jogadores por página. Só são pesquisados os jogadores vistos nos últimos 90 dias; `activeWithinDays` muda esse período, até 365.

```ts
const page = await metamob.users.search("ix-");
page.items.map((user) => user.username);

// Em um servidor, entre os jogadores vistos nos últimos 30 dias.
const filters = { server: "Draconiros", activeWithinDays: 30 };
const active = await metamob.users.search("ix-", filters).all();
```

## Ler um perfil

`users.get()` retorna o perfil público de um jogador, com a lista das missões públicas dele:

```ts
const profile = await metamob.users.get(username);

profile.bio;
profile.last_active;
profile.avatar?.name.fr;
urls.profile(profile); // o endereço do perfil em metamob.fr
```

Maiúsculas e minúsculas no nome de usuário não importam: `"ix-xs"` encontra `"Ix-xs"`, e a resposta o escreve como o dono o escreve.

## Missões públicas

`users.quests()` dá as missões públicas de um jogador, com o número de monstros que cada uma procura e oferece:

```ts
for (const quest of await metamob.users.quests(username)) {
  console.log(quest.slug, quest.character_name);
  console.log(`wants ${quest.wanted_count}, offers ${quest.offered_count}`);
}
```

## Os monstros de uma missão pública

`users.quest()` é uma [lista](/basics/lists/) dos monstros de uma missão, com o que o dono possui, procura e oferece. Cada página também contém a missão:

```ts
const page = await metamob.users.quest(username, slug, { status: "offered" });

page.quest.character_name;
page.quest.server?.name;

for (const monster of page.items) {
  console.log(monster.name.fr, `offers ${monster.offer}`);
}
```

Os mesmos filtros das suas missões se aplicam:

```ts
// O que ele procura entre os arquimonstros.
await metamob.users.quest(username, slug, { status: "wanted", type: "archimonstre" }).all();

// Tudo da etapa 12.
await metamob.users.quest(username, slug, { step: 12 }).all();
```

`want` e `offer` são o que a missão realmente procura e oferece, depois de aplicadas as configurações de troca do dono. Um jogador pode ter cópias sobrando e não oferecer nenhuma.

## As suas próprias missões

Com estes métodos, as suas missões aparecem como os outros as veem: só as públicas, sem as suas configurações. Para a visão completa e para alterá-las, use [`metamob.quests`](/resources/quests/).

## Limites e erros

- `NOT_FOUND` para um jogador que não existe, cuja conta foi excluída, ou para uma missão oculta.
- Uma busca com menos de 3 caracteres lança `INVALID_ARGUMENT` antes do envio.
- Nada aqui fica em cache por padrão. Para um perfil mostrado com frequência: `cache: { methods: { "users.get": "1m" } }`, veja [Cache](/basics/caching/).

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Users`](/reference/users/) | Os outros jogadores: seu perfil e suas missões públicas. |
| [`PublicQuest`](/reference/public-quest/) | Uma missão pública em um perfil. |
| [`PublicQuestParams`](/reference/public-quest-params/) | Filtros de [`Users.quest`](/reference/users/). |
| [`PublicQuestSummary`](/reference/public-quest-summary/) | Uma missão pública na lista de missões de um usuário. |
| [`UserProfile`](/reference/user-profile/) | O perfil público de um usuário. |
| [`UserSearchParams`](/reference/user-search-params/) | Filtros de [`Users.search`](/reference/users/). |
<!-- exports:end -->
