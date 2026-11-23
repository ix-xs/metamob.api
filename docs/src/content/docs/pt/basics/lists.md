---
title: Listas
description: "Um método paginado retorna uma requisição: com await, ela dá uma página; percorrida, todos os itens. Nada é enviado antes disso."
sidebar:
  order: 2
---

Um método paginado retorna uma requisição, que pode ser lida de três formas:

```ts
const request = metamob.monsters.list({ type: "archimonstre" });

// Uma página.
const page = await request;

// Todos os itens, página após página.
for await (const monster of request) {
  console.log(monster.name.fr);
}

// Um array.
const everything = await request.all();
```

## Uma página

Esperar uma lista com `await` dá a primeira página dela.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

page.items; // os monstros
page.total; // quantos existem com esses filtros
page.limit; // 20
page.offset; // 0
page.hasNext; // se há mais
```

Uma página é iterável, e `next()` busca a seguinte. Ele retorna `null` depois da última.

```ts
const page = await metamob.monsters.list({ type: "boss", limit: 20 });

for (const monster of page) console.log(monster.name.fr);

const second = await page.next();
```

Para começar em outro ponto, passe `offset`:

```ts
const third = await metamob.monsters.list({ limit: 20, offset: 40 });
```

## Tudo

`for await` percorre todos os itens. Uma página só é pedida quando o laço chega a ela: sair do laço interrompe as requisições.

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  if (monster.step > 20) break; // nada mais é buscado
  console.log(monster.name.fr);
}
```

Quando você não passa `limit`, um percurso usa a maior página que o endpoint aceita: 200 para monstros e missões, 50 para usuários, conversas e correspondências. Isso faz menos requisições para os mesmos dados.

## Arrays

```ts
const all = await metamob.monsters.list({ type: "archimonstre" }).all();
const first100 = await metamob.users.search("ix-").take(100);
const capped = await metamob.quests.matches(slug).all({ limit: 30 });
```

Sem limite, `all()` busca todas as páginas: em uma busca, passe um.

## O primeiro item, ou a contagem

Cada um envia uma única requisição, para um único item.

```ts
const best = await metamob.quests.matches(slug).first(); // undefined quando não há nenhuma

const missing = await metamob.quests.monsters(slug, { status: "needed" }).count();
const archmonsters = await metamob.monsters.list({ type: "archimonstre" }).count();
```

## Página por página

`pages()` dá páginas inteiras, para quando a página importa: uma barra de progresso, uma inserção em lote.

```ts
for await (const page of metamob.monsters.list().pages()) {
  console.log(`${(page.offset ?? 0) + page.items.length} of ${page.total}`);
}
```

## Páginas que trazem mais

Três listas vêm com aquilo a que pertencem, em cada página:

```ts
const template = await metamob.questTemplates.monsters(1, { step: 4 });
template.template.game_version?.name; // o modelo ao qual os monstros pertencem

const theirs = await metamob.users.quest(username, slug, { status: "offered" });
theirs.quest.character_name; // a missão à qual os monstros pertencem

const mine = await metamob.quests.monsters(slug);
mine.slug; // o slug da missão
```

## Mensagens e propostas usam um cursor

As mensagens de uma conversa e as propostas de troca não são numeradas: a API as pagina da mais recente para a mais antiga, com um cursor que ela fornece página após página. Os mesmos métodos se aplicam, mas `total` e `count()` são `undefined`.

```ts
const page = await metamob.conversations.messages(username, { limit: 20 });
page.nextBeforeId; // onde começa a próxima página, undefined no fim

const older = await page.next();

for await (const item of metamob.conversations.messages(username)) {
  // da mais recente para a mais antiga
}
```

## Listas que não são paginadas

Alguns endpoints respondem tudo de uma vez e retornam um array simples: `quests.list()`, `quests.zones()`, `users.quests()`, `zones.list()`, `zones.subzones()`, `zones.monsters()`, `kralove.list()` e as listas de referência (`servers.list()` e as outras do mesmo tipo).

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`ListRequest`](/reference/list-request/) | O que todo método paginado retorna. |
| [`Page`](/reference/page/) | Uma página de resultados. |
| [`CollectOptions`](/reference/collect-options/) | Opções de [`ListRequest.all`](/reference/list-request/) e [`ListRequest.pages`](/reference/list-request/). |
| [`PageParams`](/reference/page-params/) | Tamanho de página e ponto de partida de uma lista paginada. |
<!-- exports:end -->
