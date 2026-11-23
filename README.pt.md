<div align="center">

# @ix-xs/metamob.api

Um cliente JavaScript e TypeScript para a API do [Metamob](https://www.metamob.fr).

[![npm version](https://img.shields.io/npm/v/@ix-xs/metamob.api.svg?color=cb3837)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![npm downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg?color=cb3837)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![CI](https://img.shields.io/github/actions/workflow/status/ix-xs/metamob.api/ci.yml?branch=main&label=CI)](https://github.com/ix-xs/metamob.api/actions)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**[Documentação](https://ix-xs.github.io/metamob.api/pt/)** ·
[Français](./README.md) ·
[English](./README.en.md) ·
[Español](./README.es.md) ·
[Deutsch](./README.de.md) ·
[Histórico de mudanças](./CHANGELOG.md)

</div>

## Instalação

```bash
npm install @ix-xs/metamob.api
```

Node.js 20 ou mais recente. Também funciona com Bun, Deno, em um navegador e em plataformas edge. O pacote não tem dependências.

## Exemplo

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const [quest] = await metamob.quests.list();

if (quest) {
  // Os monstros que ainda faltam na missão.
  for await (const monster of metamob.quests.monsters(quest.slug, { status: "needed" })) {
    console.log(monster.step, monster.name.fr);
  }

  // Registrar um monstro, pelo nome ou pelo identificador.
  await metamob.quests.setMonster(quest.slug, "Bouflet le Puéril", 1);
}
```

A chave de API é criada em metamob.fr, em **Configurações > Chave de API**.

## O que o pacote cobre

- **Os 43 endpoints da API**, tipados: conta, missões, parceiros de troca, propostas de troca, mensagens privadas, monstros, zonas, jogadores, eventos do Kralamor e dados de referência.
- **Nomes**: um monstro, uma zona, um servidor ou um tipo de monstro é indicado pelo identificador ou pelo nome, em francês, inglês, espanhol, português ou alemão. Um nome desconhecido lança um erro que sugere os nomes mais próximos.
- **Listas**: um método paginado é aguardado para obter uma página, ou percorrido com `for await`.
- **O limite de requisições**: o cliente conta as 60 requisições por minuto por chave, e faz as chamadas seguintes esperarem.
- **Novas tentativas** após um 429, um erro do servidor ou uma falha de rede. O envio de uma mensagem ou de uma proposta nunca é repetido.
- **Um cache** para os dados de referência, que pode ser ajustado ou desativado.
- **`data`**: os monstros, zonas, servidores e modelos de missão incluídos no pacote, para buscar sem requisição.
- **`withKey()`**: agir com a chave de outro jogador, para um bot ou um site que atende vários jogadores.

```ts
import { data, isMetamobError } from "@ix-xs/metamob.api";

data.searchMonsters("bouf", { limit: 5 }); // sem requisição

try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
  // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
}
```

## Documentação

A documentação completa está em **[ix-xs.github.io/metamob.api](https://ix-xs.github.io/metamob.api/pt/)**, em português, [francês](https://ix-xs.github.io/metamob.api/), [inglês](https://ix-xs.github.io/metamob.api/en/), [espanhol](https://ix-xs.github.io/metamob.api/es/) e [alemão](https://ix-xs.github.io/metamob.api/de/):

- [Configuração](https://ix-xs.github.io/metamob.api/pt/basics/configuration/)
- [Todos os métodos](https://ix-xs.github.io/metamob.api/pt/resources/methods/)
- [Referência da API](https://ix-xs.github.io/metamob.api/pt/reference/)
- [Vindo da versão 4](https://ix-xs.github.io/metamob.api/pt/help/migrating-from-v4/)

## Metamob

O [Metamob](https://www.metamob.fr) é o site onde os jogadores de Dofus acompanham suas missões de arquimonstros e encontram alguém com quem trocar. O site, seus dados e sua API são trabalho dele: esta biblioteca apenas chama a API. A [documentação oficial da API](https://www.metamob.fr/help/api) continua sendo a referência.

## Licença

[MIT](./LICENSE). Um projeto independente, sem afiliação com o Metamob nem com a Ankama. Dofus é uma marca da Ankama Games. Os dados incluídos no pacote vêm da API do Metamob; usar a API significa seguir [as regras dela](https://www.metamob.fr/help/api), a começar pelo limite de requisições.
