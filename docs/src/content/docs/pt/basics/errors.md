---
title: Erros
description: "Uma chamada retorna os dados ou lança um erro. Os tipos de erro, seus códigos, e o que é tentado de novo."
sidebar:
  order: 3
---

Uma chamada retorna os dados que você pediu, ou lança um erro quando falha. Todo erro tem um `code` para testar:

```ts
try {
  await metamob.users.get(username);
} catch (error) {
  if (isMetamobError(error, "NOT_FOUND")) console.log("No such user.");
  else throw error;
}
```

## Três tipos de erro

| Classe | Quando | Extra |
| --- | --- | --- |
| `MetamobApiError` | A API respondeu com um status de erro | `status`, `messages`, `retryAfter`, `body`, `method`, `url` |
| `MetamobRequestError` | Nenhuma resposta utilizável: falha de rede, tempo esgotado, cancelamento, JSON inválido | `method`, `cause` |
| `MetamobArgumentError` | A chamada foi recusada antes de ser enviada: argumento inválido, nome desconhecido, nenhuma chave | `suggestions` |

As três estendem `MetamobError`, que tem um `code`.

## Testar um erro

`isMetamobError(error)` diz se um erro vem da biblioteca. Com um código, também verifica o código.

```ts
try {
  await metamob.quests.setMonster(slug, "Bouftou Royal", 3);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) {
    // um erro de digitação no nome do monstro
  } else if (isMetamobError(error, "NOT_FOUND")) {
    // a missão não existe, ou não é sua
  } else if (isMetamobError(error, "UNAUTHORIZED")) {
    // a chave foi revogada
  } else {
    throw error;
  }
}
```

Um erro da API também tem atalhos para os casos mais comuns:

```ts
try {
  await metamob.quests.get(slug);
} catch (error) {
  if (error instanceof MetamobApiError) {
    error.isNotFound; // 404
    error.isUnauthorized; // 401
    error.isRateLimited; // 429
    error.status; // o status HTTP
    error.messages; // o que a API disse, por campo: { error: "Quest not found" }
  }
}
```

## O que um 404 significa

A API responde 404 para o que não existe e para o que não é seu. `quests.get()`, `quests.monsters()` e todas as escritas respondem `NOT_FOUND` para uma missão de outra conta, exista ela ou não. `users.quest()` responde `NOT_FOUND` para uma missão oculta.

## O que é tentado de novo

Algumas falhas são temporárias. Nesses casos, a biblioteca envia a requisição de novo antes de lançar o erro:

| Falha | Tentada de novo |
| --- | --- |
| 429, limite de requisições | Sim, depois da espera que a API pede |
| 502, 503, 504 | Sim |
| 500 | Somente em leituras |
| Falha de rede, tempo esgotado | Sim |
| 400, 401, 403, 404 | Não |
| Cancelada com o seu `signal` | Não |

Por padrão, há até 3 tentativas a mais. O intervalo começa em 500 ms e dobra a cada vez, até 60 segundos. Quando a API envia `Retry-After`, essa espera é usada. Um `Retry-After` maior que `maxDelay` não é esperado: o erro é lançado na hora, com seu `retryAfter` em segundos.

As escritas que definem um valor, em uma missão ou em uma conversa, dão o mesmo resultado quando enviadas duas vezes: elas também são tentadas de novo. O envio de uma mensagem ou de uma proposta de troca nunca é, já que chegaria duas vezes. Depois de um tempo esgotado, verifique se ela não saiu antes de enviá-la de novo.

O número de tentativas pode ser definido para o cliente ou para uma chamada:

```ts
// Para todo o cliente.
const patient = new Metamob({ retry: { attempts: 5, delay: "1s", maxDelay: "2m" } });
const strict = new Metamob({ retry: false });

// Para uma chamada.
await metamob.quests.get(slug, { retry: false });
```

Para ver as novas tentativas quando acontecem:

```ts
metamob.on("retry", ({ method, attempt, delay, error }) => {
  console.warn(`${method}: attempt ${attempt} in ${delay} ms (${error.message})`);
});
```

## Tempo limite e cancelamento

Uma tentativa tem 30 segundos por padrão. `timeout` muda esse prazo, para o cliente ou para uma chamada. Um `signal` cancela uma chamada de fora, inclusive enquanto ela espera o limitador de requisições.

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 2000);

try {
  await metamob.quests.matches(slug, {}, { signal: controller.signal, timeout: "5s" });
} catch (error) {
  if (isMetamobError(error, "ABORTED")) console.log("Cancelled.");
  if (isMetamobError(error, "TIMEOUT")) console.log("Too slow.");
}
```

## Os argumentos são verificados antes

Um argumento que a API certamente recusaria é recusado antes do envio, com `INVALID_ARGUMENT`: um slug vazio, uma quantidade negativa, uma busca com menos de 3 caracteres, uma data no formato errado, uma mensagem com mais de 1000 caracteres, uma proposta sem monstros.

<!-- exports:start -->
## Referência

Cada export tem sua página na [referência](/reference/):

| Export | Para que serve |
| --- | --- |
| [`MetamobApiError`](/reference/metamob-api-error/) | A API respondeu com um status de erro. |
| [`MetamobArgumentError`](/reference/metamob-argument-error/) | Lançado antes de a chamada a que se refere ser enviada: um argumento inválido, uma chave de API ausente, ou um nome que não corresponde a nenhum monstro, zona ou servidor. |
| [`MetamobError`](/reference/metamob-error/) | Classe base de tudo o que esta biblioteca lança. |
| [`MetamobRequestError`](/reference/metamob-request-error/) | A requisição nunca produziu uma resposta utilizável: tempo esgotado, falha de rede, cancelamento ou corpo ilegível. |
| [`isMetamobError`](/reference/is-metamob-error/) | Type guard para os erros lançados por esta biblioteca, opcionalmente restrito a um código. |
| [`MetamobErrorCode`](/reference/metamob-error-code/) | O `code` de cada erro que esta biblioteca lança. |
<!-- exports:end -->
