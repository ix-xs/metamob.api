---
title: Compte
description: "metamob.me() indique à quel compte appartient une clé API."
sidebar:
  order: 1
---

## Ce que vous recevez

`metamob.me()` renvoie le pseudo, la bio, l'avatar et la dernière activité du compte de la clé. Rien de privé : c'est ce que montre le profil public, sans les quêtes.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // l'avatar est un monstre
  console.log(urls.monsterImage(me.avatar)); // son image
}
```

## D'une clé à tout le reste

Les points d'accès publics demandent un pseudo, que `me()` donne :

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // tel que les autres le voient
console.log(`${profile.quests.length} public quests`);
```

Les quêtes du compte, y compris les quêtes masquées, se trouvent sous [`metamob.quests`](/resources/quests/). Le profil et les quêtes publiques de n'importe quel joueur se trouvent sous [`metamob.users`](/resources/users/).

## Valider une clé

`me()` est l'appel le plus léger qui exige une clé valide : c'est le bon test quand un joueur vous donne la sienne.

```ts
async function whose(key: string) {
  try {
    return (await metamob.withKey(key).me()).username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined;
    throw error;
  }
}
```

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Account`](/reference/account/) | Le compte auquel appartient une clé API. |
| [`Avatar`](/reference/avatar/) | Le monstre qu'un joueur a choisi comme avatar. |
| [`UserSummary`](/reference/user-summary/) | Un joueur tel que le renvoie une recherche ou une correspondance d'échange. |
<!-- exports:end -->
