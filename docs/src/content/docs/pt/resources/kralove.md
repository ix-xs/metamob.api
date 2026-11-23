---
title: Eventos do Kralamor
description: "Ler os eventos do Kralamor de um servidor, seus participantes e suas mensagens."
sidebar:
  order: 9
---

Abrir o covil do Kralamor Gigante exige muita gente: os jogadores o organizam no Metamob, em torno de eventos.

## Listar os eventos

Sem filtros, `kralove.list()` retorna os eventos a partir de hoje, em todos os servidores. `from` começa em outro dia:

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// A partir de um dia: uma Date ou "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

Um servidor é um nome, um id ou um objeto, veja [Nomes e ids](/basics/names-and-ids/). Uma `Date` é lida em UTC.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`organised by ${event.creator ?? "a deleted account"}`);
}
```

## Ler um evento

`kralove.get()` adiciona os participantes e as mensagens. Ele recebe o id do evento, ou o próprio evento:

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const event = await metamob.kralove.get(next);

  for (const { username, character_count } of event.participants) {
    console.log(username ?? "a deleted account", `x${character_count}`);
  }
  for (const { username, content } of event.messages) {
    console.log(`${username ?? "a deleted account"}: ${content}`);
  }
}
```

`updated_at` dá a última mudança no próprio evento: a data ou a descrição. Inscrições e mensagens não o alteram.

## Nomes ausentes

`creator`, e o `username` de um participante ou de uma mensagem, podem ser `null`: quando a conta foi excluída, ou quando um de vocês bloqueou o outro. Preveja isso onde quer que você mostre um nome.

Como um bloqueio muda a resposta de uma chave para outra, os eventos não ficam em cache por padrão.

## Anunciar a próxima abertura

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime).toLocaleString("fr-FR");
  await notify(`Kralamoure on ${when}: ${next.character_count} characters so far.`);
}
```

Uma verificação a cada poucos minutos basta. Para ler a lista com mais frequência sem mais requisições, coloque-a em cache: `cache: { methods: { "kralove.list": "5m" } }`.

## Limites e erros

- A API lê os eventos. Criar um, se inscrever e publicar uma mensagem se fazem no site.
- `NOT_FOUND` para um evento que não existe, ou que o criador cancelou: um evento cancelado é excluído.
- `from` em outro formato que não `YYYY-MM-DD` lança `INVALID_ARGUMENT` antes do envio.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`Kralove`](/reference/kralove/) | Os eventos do Kralamor: encontros que os jogadores organizam para combater o Kralamor. |
| [`KraloveEvent`](/reference/kralove-event/) | Um evento do Kralamor, como a lista o retorna. |
| [`KraloveEventDetail`](/reference/kralove-event-detail/) | Um evento do Kralamor com seus participantes e suas mensagens. |
| [`KraloveListParams`](/reference/kralove-list-params/) | Filtros de [`Kralove.list`](/reference/kralove/). |
| [`KraloveMessage`](/reference/kralove-message/) | Uma mensagem publicada em um evento do Kralamor. |
| [`KraloveParticipant`](/reference/kralove-participant/) | Alguém que participa de um evento do Kralamor. |
<!-- exports:end -->
