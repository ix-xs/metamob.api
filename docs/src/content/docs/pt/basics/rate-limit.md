---
title: O limite de requisições
description: "O Metamob permite 60 requisições por minuto por chave. Como o cliente as conta, e como acompanhar e ajustar o limite."
sidebar:
  order: 4
---

## O que a API permite

60 requisições por minuto, contadas por chave de API. Além disso, a API responde 429 com um cabeçalho `Retry-After`.

O limite mantém o site disponível para todos: fique abaixo dele, e não tente contorná-lo.

## O que o cliente faz

O cliente conta as requisições enviadas com cada chave durante o último minuto. Quando 60 já saíram, a próxima chamada espera até que a mais antiga tenha um minuto, e então sai. As chamadas mantêm a ordem.

Um laço de 300 requisições leva, portanto, cerca de cinco minutos, sem erro.

Se mesmo assim chegar um 429, por exemplo porque outro programa usa a mesma chave, o cliente espera o tempo que a API pede, e tenta de novo. Veja [o que é tentado de novo](/basics/errors/#what-is-retried).

## Acompanhar

`metamob.rateLimit` diz onde está a chave do cliente, segundo a contagem deste cliente: ele não sabe nada das requisições feitas em outro lugar com a mesma chave.

```ts
const state = metamob.rateLimit;
if (state && state.remaining < 5) {
  console.log(`Almost there: free again in ${Math.ceil(state.resetsIn / 1000)} s`);
}
```

O evento `rateLimit` é emitido cada vez que uma chamada precisou esperar, com a duração da espera:

```ts
metamob.on("rateLimit", ({ method, delay }) => {
  console.log(`${method} waited ${delay} ms for its turn`);
});
```

## Gastar menos requisições

O limite conta requisições, não itens. O cliente já envia o menor número possível:

- Percorrer uma lista usa a maior página que a API aceita, veja [Listas](/basics/lists/).
- `count()` e `first()` pedem um item em vez de uma página.
- Os dados de referência ficam [em cache](/basics/caching/), e duas chamadas idênticas em andamento compartilham uma requisição.
- Os nomes são resolvidos a partir dos [dados do pacote](/basics/embedded-data/), sem requisição.
- `quests.setMonsters()` escreve até 200 monstros em uma requisição.

Do seu lado:

```ts
import { data } from "@ix-xs/metamob.api";

// Ler dados de referência: pergunte ao pacote, não à API.
const monster = data.monster("Tofu Maléfique"); // nenhuma requisição
const fromApi = await metamob.monsters.get("Tofu Maléfique"); // 1 requisição, com as zonas

// Muitas quantidades: um lote, não um laço.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 1 });
```

## Ajustar

```ts
// Abaixo do limite, para deixar espaço a outro programa.
const gentle = new Metamob({ rateLimit: { requests: 30, per: "1m" } });

// Desativado: uma rajada recebe 429, tentados de novo depois da espera que a API pede.
const unlimited = new Metamob({ rateLimit: false });
```

Aumentar `requests` acima de 60 não aumenta o que a API permite: só transfere a espera do cliente para respostas 429.

## Várias chaves

Cada chave tem sua própria janela. Um cliente criado com [`withKey()`](/basics/many-keys/) compartilha o limitador do cliente de onde vem, que conta cada chave separadamente.

## Cancelar uma espera

Uma chamada que espera a vez dela pode ser cancelada com um `signal`. Ela lança um erro com o código `ABORTED` e libera o lugar.

```ts
await metamob.monsters.get("Tofu", {}, { signal: AbortSignal.timeout(10_000) });
```

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`RateLimitOptions`](/reference/rate-limit-options/) | Configurações do limitador de requisições integrado. |
| [`RateLimitState`](/reference/rate-limit-state/) | Em que ponto uma chave de API está em relação ao seu limite de requisições, segundo a contagem deste cliente. |
<!-- exports:end -->
