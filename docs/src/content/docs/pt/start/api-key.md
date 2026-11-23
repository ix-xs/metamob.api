---
title: Sua chave de API
description: "Criar uma chave de API do Metamob, passá-la ao cliente, verificá-la e mantê-la segura."
---

## Criar uma chave

Entre em [metamob.fr](https://www.metamob.fr), abra **Configurações** e depois a seção **Chave de API**, e gere uma chave. Copie-a na hora: o site a mostra uma única vez.

A chave pertence à sua conta. Cada chamada feita com ela é feita em seu nome, e ela sempre dá acesso total: não existe chave somente leitura.

## O que uma chave permite

| Com qualquer chave | Somente com a chave da conta |
| --- | --- |
| Monstros, zonas, servidores, modelos de missão | `metamob.me()` |
| Perfis e missões públicos de qualquer jogador | `metamob.quests`: configurações, monstros, correspondências, progresso e escritas |
| Eventos do Kralamor | `metamob.conversations` e `metamob.tradeProposals`. O envio de mensagens e de propostas é liberado pelo Metamob conta por conta |

A API pede uma chave em toda chamada, mesmo para os dados públicos.

## Passar a chave ao cliente

O cliente procura a chave em três lugares, do mais geral ao mais específico:

1. a variável de ambiente `METAMOB_API_KEY`;
2. a opção `apiKey` do cliente;
3. `{ apiKey }` como último argumento de uma chamada, ou [`metamob.withKey()`](/basics/many-keys/), para agir com a chave de outro jogador.

```bash title=".env"
METAMOB_API_KEY=your-key
```

```ts
const metamob = new Metamob(); // lê METAMOB_API_KEY

const explicit = new Metamob({ apiKey });
const short = new Metamob(apiKey);

const quests = await metamob.quests.list({ apiKey: theirKey });
```

Sem chave, a primeira chamada lança um erro `MISSING_API_KEY`.

## Verificar uma chave

`metamob.me()` é a chamada mais simples para saber se uma chave funciona e de quem ela é:

```ts
try {
  const account = await metamob.withKey(theirKey).me();
  console.log(`This key belongs to ${account.username}`);
} catch (error) {
  if (!isMetamobError(error, "UNAUTHORIZED")) throw error;
  console.log("This key is not valid, or was revoked.");
}
```

## Mantê-la segura

- Nunca publique uma chave: nem em um commit, nem em uma issue, nem em um log. A biblioteca nunca a coloca em uma URL, um erro ou um evento.
- Em uma página web, uma chave fica visível para todos que abrem a página. Chame a API a partir de um servidor, exceto em uma página que só o dono da chave usa.
- Se jogadores confiarem a chave deles a você, trate-a como uma senha: criptografada, e apagada quando eles saírem.
- Se uma chave vazar, gere uma nova em metamob.fr: a antiga para de funcionar.

## O limite acompanha a chave

Cada chave tem suas próprias 60 requisições por minuto. Assim, um bot pode agir por vários jogadores, cada um com sua chave. Usar várias chaves para ir mais rápido não é o objetivo: o limite protege o servidor do Metamob. Veja [O limite de requisições](/basics/rate-limit/).
