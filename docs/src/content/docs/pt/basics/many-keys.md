---
title: Agir por outros jogadores
description: "Usar as chaves que os jogadores deram a você, com um único cliente."
sidebar:
  order: 7
---

## Para que serve

Uma chave de API age em nome do seu dono: ela lê as missões e mensagens dele, e escreve nas missões dele. Um bot ou um site que gerencia as missões de vários jogadores precisa, portanto, da chave de cada um deles, dada de livre vontade.

Esse é o único uso previsto. Cada chave tem suas próprias 60 requisições por minuto: usar várias chaves para enviar mais requisições para você mesmo equivale a contornar o limite. Veja [O limite de requisições](/basics/rate-limit/).

## Um cliente por jogador

`withKey()` retorna um cliente que usa outra chave. Ele é leve: crie um a cada requisição de um jogador.

```ts
async function progress(playerKey: string) {
  const player = metamob.withKey(playerKey);
  const account = await player.me();
  const quests = await player.quests.list();
  return { username: account.username, quests: quests.length };
}
```

Ele compartilha com o cliente de onde vem:

- as opções: tempo limite, novas tentativas, URL base, cabeçalhos;
- o cache dos dados de referência;
- os listeners: `metamob.on("retry", ...)` ouve todos os clientes;
- o limitador de requisições, que conta cada chave separadamente.

O que depende da conta fica em cache separado para cada chave: um jogador nunca vê as missões de outro.

## Uma chave para uma chamada

Para uma única chamada, a chave vai nas opções, como último argumento:

```ts
const quests = await metamob.quests.list({ apiKey: theirKey });
await metamob.quests.setMonster(slug, "Tofu Maléfique", 1, { apiKey: theirKey });
```

## Descobrir de quem é a chave

`me()` dá o nome de usuário do dono da chave, o que é útil para os endpoints públicos:

```ts
const player = metamob.withKey(theirKey);
const { username } = await player.me();
const publicQuests = await player.users.quests(username);
```

Também é assim que se valida uma chave quando um jogador a fornece:

```ts
async function register(playerKey: string) {
  try {
    const { username } = await metamob.withKey(playerKey).me();
    await db.players.save({ username, key: playerKey });
    return username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined; // não é uma chave válida
    throw error;
  }
}
```

## Um cliente sem chave própria

Um serviço que só age pelos jogadores não precisa de chave própria. Crie o cliente sem chave, depois derive dele um por jogador. `METAMOB_API_KEY` não deve estar definida, senão seria usada.

```ts
const base = new Metamob({ cache: { ttl: "1h" } });

const player = base.withKey(theirKey);
await player.quests.list();
```

Uma chamada feita diretamente com `base` lança então `MISSING_API_KEY`.

## Guardar as chaves

Uma chave é uma senha de uma conta do Metamob.

- Guarde-a criptografada, e nunca a escreva em um log. A biblioteca a mantém fora das URLs, dos erros e dos eventos.
- Peça-a por HTTPS, em um formulário ou em um comando privado, nunca em um canal público.
- Apague-a quando o jogador sair, e diga a ele que pode revogá-la a qualquer momento em metamob.fr, em Configurações > Chave de API.
- Um `401` em uma chave que funcionava significa que ela foi revogada: pare de usá-la.

## Referência

| | |
| --- | --- |
| `metamob.withKey(apiKey)` | Um cliente para essa chave, que compartilha opções, cache, listeners e limitador |
| `{ apiKey }` como último argumento | A chave para uma chamada |
| `metamob.me()` | A conta da chave em uso |
