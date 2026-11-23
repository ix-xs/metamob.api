---
title: Códigos de erro
description: "Os códigos de erro, sua causa, se são tentados de novo, e as propriedades de cada classe de erro."
---

Todo erro estende `MetamobError` e tem um `code`. [Erros](/basics/errors/) explica como tratá-los; esta página os lista.

## Códigos

`code` é um `MetamobErrorCode`. São 15.

"Tentado de novo" significa até 3 tentativas a mais por padrão. O intervalo começa em 500 ms e dobra, até 60 segundos. Quando a API envia um `Retry-After`, essa espera é usada, a menos que seja maior que `retry.maxDelay`: o erro é então lançado na hora, com seu `retryAfter`.

Da API, como um `MetamobApiError`:

| Código | Status | Causa | Tentado de novo |
| --- | --- | --- | --- |
| `BAD_REQUEST` | 400, 422 | Um parâmetro que a API recusa | Não |
| `UNAUTHORIZED` | 401 | A chave está ausente, é inválida ou foi revogada | Não |
| `FORBIDDEN` | 403 | A chave não pode fazer isso: o envio não está liberado na conta, ou um dos dois jogadores bloqueou o outro | Não |
| `NOT_FOUND` | 404 | Não existe, ou não é seu: uma missão de outra conta, uma missão oculta, um jogador excluído | Não |
| `CONFLICT` | 409 | O estado não permite: uma proposta já cancelada ou já aplicada por você, ou uma para a qual faltam cópias | Não |
| `RATE_LIMITED` | 429 | Mais de 60 requisições em um minuto com esta chave, ou os limites antispam do site em uma mensagem ou proposta | Sim, exceto uma mensagem ou uma proposta |
| `SERVER_ERROR` | 500 e acima | A API falhou | 502, 503, 504: sim, exceto uma mensagem ou uma proposta. 500: somente leituras |
| `API_ERROR` | qualquer outro | Outro status de erro | Não |

Da requisição, como um `MetamobRequestError`:

| Código | Causa | Tentado de novo |
| --- | --- | --- |
| `TIMEOUT` | Uma tentativa não teve resposta dentro de `timeout`, 30 segundos por padrão | Sim, exceto uma mensagem ou uma proposta |
| `NETWORK` | A requisição não pôde ser feita: sem conexão, DNS, TLS | Sim, exceto uma mensagem ou uma proposta |
| `ABORTED` | Seu `signal` cancelou a chamada | Não |
| `PARSE_ERROR` | A API respondeu 200 com algo que não é JSON | Não |

Da biblioteca, como um `MetamobArgumentError`, antes de qualquer envio:

| Código | Causa |
| --- | --- |
| `MISSING_API_KEY` | Nenhuma chave nas opções do cliente, nas opções da chamada ou em `METAMOB_API_KEY` |
| `INVALID_ARGUMENT` | Um argumento que não pode estar certo: um slug vazio, uma quantidade negativa, uma busca com menos de 3 caracteres, uma data no formato errado, um lote vazio, uma mensagem com mais de 1000 caracteres, uma proposta sem monstros |
| `UNKNOWN_NAME` | Nenhum monstro, zona, subzona, servidor, versão ou tipo tem esse nome. `suggestions` contém os mais próximos |

## MetamobError

A base das três.

| Propriedade | Tipo | Significado |
| --- | --- | --- |
| `code` | `MetamobErrorCode` | Um dos códigos acima |
| `message` | `string` | O método, depois o que falhou |
| `name` | `string` | O nome da classe |
| `cause` | `unknown` | O erro original, quando existe |

## MetamobApiError

| Propriedade | Tipo | Significado |
| --- | --- | --- |
| `status` | `number` | O status HTTP |
| `method` | `string` | O método que falhou, por exemplo `quests.get` |
| `url` | `string` | O endereço chamado. Nunca contém a chave |
| `messages` | `Record<string, string>` | O que a API disse, por campo. Muitas vezes `{ error: "..." }` |
| `retryAfter` | `number \| undefined` | O número de segundos que a API pediu para esperar, em um 429 |
| `body` | `unknown` | O corpo da resposta, analisado quando é JSON |
| `isNotFound` | `boolean` | `status === 404` |
| `isUnauthorized` | `boolean` | `status === 401` |
| `isRateLimited` | `boolean` | `status === 429` |

A mensagem de erro da API vai para `message` e `messages`.

## MetamobRequestError

| Propriedade | Tipo | Significado |
| --- | --- | --- |
| `method` | `string` | O método que falhou |
| `cause` | `unknown` | O que `fetch` lançou, ou o motivo do cancelamento |

## MetamobArgumentError

| Propriedade | Tipo | Significado |
| --- | --- | --- |
| `suggestions` | `readonly string[]` | Para `UNKNOWN_NAME`, os nomes existentes mais próximos, o melhor primeiro. Vazio nos outros casos |

## isMetamobError

```ts
function handle(error: unknown) {
  if (isMetamobError(error)) error.code; // qualquer erro da biblioteca
  if (isMetamobError(error, "NOT_FOUND")) error.message; // um código
}
```

É um type guard: dentro do bloco, `error` é um `MetamobError`.
