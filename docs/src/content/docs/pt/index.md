---
title: Instalação
description: "O cliente JavaScript e TypeScript da API do Metamob: seus 43 endpoints, tipados, sem nenhuma dependência."
---

```bash
npm install @ix-xs/metamob.api
```

Ou `pnpm add`, `yarn add`, `bun add`. Os tipos estão incluídos.

| Requisito | |
| --- | --- |
| Node.js | 20 ou mais recente |
| Módulos | ES modules e CommonJS |
| Outros ambientes | Bun, Deno, navegadores, plataformas edge: veja [Ambientes de execução](/help/runtimes/) |
| Chave de API | Uma chave do Metamob, veja [Sua chave de API](/start/api-key/) |

## Primeira chamada

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const quests = await metamob.quests.list();
const needed = await metamob.quests.monsters(quests[0]!.slug, { status: "needed" }).count();
```

Em CommonJS:

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

Sem `apiKey`, o cliente lê a variável de ambiente `METAMOB_API_KEY`. [Configuração](/basics/configuration/) lista todas as suas opções.

## O que o cliente resolve

| | |
| --- | --- |
| Tipos | Cada resposta da API é tipada: veja a [referência](/reference/) |
| Nomes | Monstros, zonas e servidores pelo nome, nos cinco idiomas do site: [Nomes e ids](/basics/names-and-ids/) |
| Listas | Paginação por offset ou por cursor, percorrida com `for await`: [Listas](/basics/lists/) |
| O limite de requisições | 60 requisições por minuto por chave, as chamadas além disso esperam a vez: [O limite de requisições](/basics/rate-limit/) |
| Erros | Um `code` estável por caso, e novas tentativas para os erros passageiros: [Erros](/basics/errors/) |
| Cache | Os dados de referência mantidos em memória, um armazenamento substituível: [Cache](/basics/caching/) |
| Dados do jogo | Monstros, zonas e servidores incluídos, pesquisáveis sem requisição: [Os dados do pacote](/basics/embedded-data/) |

## Metamob

Tudo se apoia no [Metamob](https://www.metamob.fr), o site dos caçadores de arquimonstros, e na sua API. Este pacote apenas a chama: a [documentação oficial da API](https://www.metamob.fr/help/api) continua sendo a referência.
