---
title: Solução de problemas
description: "Os problemas mais comuns, o que significam e como resolvê-los."
---

## MISSING_API_KEY

Nenhuma chave chegou ao cliente. Verifique, nesta ordem:

- A variável de ambiente `METAMOB_API_KEY` está definida no processo que executa o seu código. O Node.js não lê um arquivo `.env` sozinho: inicie com `node --env-file=.env app.mjs`, ou carregue-o com o seu framework.
- Você passou `apiKey` e ele não é `undefined`. `new Metamob({ apiKey: process.env.METAMOB_KEY })` com uma variável com o nome errado é a causa habitual.
- Em uma plataforma edge pode não haver variável de ambiente: passe a chave você mesmo, veja [Ambientes de execução](/help/runtimes/#the-api-key).

## UNAUTHORIZED

A API não aceita a chave: mal copiada, ou revogada porque uma nova foi criada. Gere uma em metamob.fr, em Configurações > Chave de API, e verifique-a com `metamob.me()`.

```ts
try {
  console.log((await metamob.me()).username);
} catch (error) {
  if (isMetamobError(error, "UNAUTHORIZED")) console.log("This key does not work.");
}
```

## NOT_FOUND em uma das minhas missões

A API responde 404 para o que não é seu, assim como para o que não existe.

- O slug pertence a uma missão de outra conta. `quests.list()` dá os slugs da chave em uso.
- Você está usando a chave de outro jogador com o seu slug, ou o contrário. Com [`withKey()`](/basics/many-keys/), os slugs acompanham a chave deles.
- Com `users.quest()`, a missão está oculta no perfil público. O dono dela continua lendo-a com `quests.monsters()`.

## UNKNOWN_NAME para um nome que existe

- Verifique a grafia com `error.suggestions`. Acentos e maiúsculas são perdoados, uma letra a menos ou a mais não.
- O nome pode ser mais recente que a sua versão do pacote. A biblioteca então o procura na API, exceto para uma subzona dada sozinha, que a API só procura dentro de uma zona: passe `{ zone }`, veja [Zonas](/resources/zones/#subzones).
- Atualize o pacote: cada versão inclui os nomes atuais.

## O monstro errado para um nome compartilhado

Cada versão do jogo tem seus próprios monstros, e a maioria tem o mesmo nome de uma versão para outra. `monsters.get("Crognan le Barbare")` retorna o do Dofus (Unity). Adicione `{ gameVersion }`, ou use o id. As escritas em uma missão não são afetadas: elas pegam o monstro dessa missão. Veja [Nomes e ids](/basics/names-and-ids/#monsters-that-share-a-name).

## Meu script está lento

Ele provavelmente está esperando por causa do limite de 60 requisições por minuto. O evento `rateLimit` confirma:

```ts
metamob.on("rateLimit", ({ method, delay }) => console.log(`${method} waited ${delay} ms`));
```

Para enviar menos requisições: um `setMonsters()` em vez de vários `setMonster()`, `count()` em vez de contar páginas, [`data`](/basics/embedded-data/) em vez das chamadas de referência. Veja [O limite de requisições](/basics/rate-limit/#spending-fewer-requests).

## RATE_LIMITED mesmo com o limitador ativo

O cliente só conta as próprias requisições. A chave provavelmente também é usada em outro lugar: outro processo, outra instância do servidor, um segundo cliente no mesmo programa. Compartilhe um único cliente, ou reduza o limite de cada um com `rateLimit: { requests: 30 }`.

## Um valor que acabei de escrever é lido sem mudança

As leituras ligadas à conta só ficam em cache se você pediu. Com uma validade para `quests.get` ou `quests.monsters` em `cache.methods`, uma escrita feita com o mesmo cliente esvazia o cache, mas não uma escrita feita em outro lugar, no site por exemplo. Passe `{ cache: false }` na leitura, ou encurte a validade.

## setMonster não somou um

Ele define a quantidade, não soma a ela. Leia, depois escreva:

```ts
const tofu = data.monster("Tofu Maléfique");
const monsters = await metamob.quests.monsters(slug).all();
const owned = monsters.find((monster) => monster.id === tofu?.id)?.quantity ?? 0;

await metamob.quests.setMonster(slug, "Tofu Maléfique", owned + 1);
```

## TIMEOUT ou NETWORK

A requisição não passou, mesmo depois de 3 novas tentativas. Verifique a conexão da máquina, depois se metamob.fr responde. Atrás de um proxy, dê ao cliente um `fetch` que o use, veja [Configuração](/basics/configuration/#another-fetch-another-host).

## SERVER_ERROR

A API falhou do lado dela, e as leituras já foram tentadas de novo. Se persistir, o site pode estar em manutenção: espere em vez de repetir em laço.

Uma mensagem ou uma proposta não é tentada de novo: depois de um `SERVER_ERROR`, olhe a conversa ou `tradeProposals.list()` antes de enviá-la de novo, ela pode ter passado.

## Funciona no meu servidor e falha no navegador

Uma página só pode chamar uma API que permite a origem dela. Chame o Metamob a partir do seu servidor, e faça a página chamar o seu servidor: a chave também fica fora da página. Veja [Ambientes de execução](/help/runtimes/#browsers).

## require() retorna algo sem Metamob

A versão 5 tem exportações nomeadas. `const MetamobAPI = require("@ix-xs/metamob.api")` vira `const { Metamob } = require("@ix-xs/metamob.api")`. Veja [Vindo da versão 4](/help/migrating-from-v4/).

## Ainda sem solução

Abra uma issue no [GitHub](https://github.com/ix-xs/metamob.api/issues) com a versão do pacote, o seu ambiente de execução, `error.code` e o menor código que mostra o problema. Retire a sua chave de API de tudo o que você colar.
