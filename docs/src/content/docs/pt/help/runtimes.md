---
title: Ambientes de execução
description: "Node.js 20 ou mais recente, Bun, Deno, plataformas edge e navegadores, como ES module ou como CommonJS."
---

## Do que ela precisa

`fetch`, `AbortController` e `URL`, que todo ambiente atual fornece. O pacote não tem nenhuma dependência, e nada nele é específico do Node.js. Ele pode ser importado como ES module ou como CommonJS:

```ts
import { Metamob } from "@ix-xs/metamob.api"; // ES modules
```

```js
const { Metamob } = require("@ix-xs/metamob.api"); // CommonJS
```

| Ambiente | Funciona | Observações |
| --- | --- | --- |
| Node.js 20 ou mais recente | Sim | ES modules e CommonJS |
| Bun | Sim | |
| Deno | Sim | `import { Metamob } from "npm:@ix-xs/metamob.api"` |
| Cloudflare Workers, Vercel Edge | Sim | Veja a observação sobre o estado abaixo |
| Navegadores | Sim | Veja a observação sobre as chaves abaixo |

## A chave de API

Quando você não passa `apiKey`, o cliente lê a variável de ambiente `METAMOB_API_KEY`, onde o ambiente tem uma. Nos outros casos, passe a chave.

```ts
// Cloudflare Workers: a chave é um segredo do worker.
export default {
  async fetch(request: Request, env: { METAMOB_API_KEY: string }) {
    const metamob = new Metamob({ apiKey: env.METAMOB_API_KEY });
    const servers = await metamob.servers.list();
    return Response.json(servers);
  },
};
```

## Navegadores

Tudo funciona em uma página web, mas uma chave ali pode ser lida por quem abrir a página. Dois casos são aceitáveis:

- Uma ferramenta que cada jogador usa com a própria chave, digitada e guardada no dispositivo dele.
- [`data`](/basics/embedded-data/) sozinho, que não precisa de chave: busca, autocompletar, "onde vive este monstro".

Para todo o resto, chame a API a partir do seu servidor.

Se um navegador pode chamar a API a partir do seu domínio depende da política CORS de metamob.fr. Se uma chamada falha em uma página mas funciona em um servidor, esse é o motivo: passe pelo seu servidor.

## O estado em plataformas serverless

O limitador de requisições e o cache vivem no cliente, em memória. Em uma plataforma que inicia uma nova instância para cada requisição, cada instância começa a contar do zero.

- Crie o cliente fora do handler, para que as instâncias já iniciadas o reutilizem.
- Dê ao cache um armazenamento que sobreviva à instância, veja [Cache](/basics/caching/#a-cache-that-outlives-the-process).
- Evite rajadas. Quando várias instâncias compartilham uma chave, a API pode responder 429: o cliente espera o tempo que ela pede, e tenta de novo.

## Tamanho do bundle

O pacote cabe em um arquivo por sistema de módulos, cerca de 160 kB antes da compressão, mais da metade para os dados de referência. Com um bundler, importar só `data` deixa o cliente de fora. `Metamob` mantém os dados, que usa para ler os nomes.

## Tipos

As declarações vêm com o pacote, para ES modules e para CommonJS. Elas são resolvidas com qualquer configuração `moduleResolution` do TypeScript. TypeScript 5 ou mais recente é recomendado.

Os nomes dos monstros são grandes tipos de união, que só servem para o autocompletar. Se o seu editor ficar lento, anotar uma variável como `string` os evita.

## Testar o seu código

Dê ao cliente o seu próprio `fetch` para testar sem rede:

```ts
const metamob = new Metamob({
  apiKey: "test",
  rateLimit: false,
  retry: false,
  fetch: async () =>
    Response.json({
      data: { username: "Ix-xs", bio: "", avatar: null, last_active: "2026-10-14T09:12:45Z" },
    }),
});

const me = await metamob.me();
me.username; // "Ix-xs"
```
