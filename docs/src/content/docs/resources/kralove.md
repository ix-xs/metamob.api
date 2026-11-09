---
title: Événements Kralamoure
description: "Lire les événements Kralamoure d'un serveur, leurs participants et leurs messages."
sidebar:
  order: 9
---

Ouvrir l'antre du Kralamoure Géant demande beaucoup de monde : les joueurs s'organisent sur Metamob, autour d'événements.

## Lister les événements

Sans filtre, `kralove.list()` renvoie les événements à partir d'aujourd'hui, sur tous les serveurs. `from` part d'un autre jour :

```ts
const everywhere = await metamob.kralove.list();
const draconiros = await metamob.kralove.list({ server: "Draconiros" });

// À partir d'un jour donné : une Date ou "YYYY-MM-DD".
const since = await metamob.kralove.list({ from: "2026-01-01" });
const today = await metamob.kralove.list({ from: new Date() });
```

Un serveur est un nom, un identifiant ou un objet, voir [Noms et identifiants](/basics/names-and-ids/). Une `Date` est lue en UTC.

```ts
for (const event of await metamob.kralove.list({ server: "Draconiros" })) {
  console.log(event.description);
  console.log(`${event.participants_count} players, ${event.character_count} characters`);
  console.log(`organised by ${event.creator ?? "a deleted account"}`);
}
```

## Lire un événement

`kralove.get()` ajoute les participants et les messages. Elle prend l'identifiant de l'événement, ou l'événement lui-même :

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const event = await metamob.kralove.get(next);

  for (const { username, character_count } of event.participants) {
    console.log(username ?? "a deleted account", `x${character_count}`);
  }
  for (const { username, content } of event.messages) {
    console.log(`${username ?? "a deleted account"}: ${content}`);
  }
}
```

## Les noms manquants

`creator`, et le `username` d'un participant ou d'un message, peuvent valoir `null` : quand le compte a été supprimé, ou quand l'un de vous deux a bloqué l'autre. Prévoyez-le partout où vous affichez un nom.

Comme un blocage change la réponse d'une clé à l'autre, les événements ne sont pas mis en cache par défaut.

## Annoncer la prochaine ouverture

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime).toLocaleString("fr-FR");
  await notify(`Kralamoure on ${when}: ${next.character_count} characters so far.`);
}
```

Une vérification toutes les quelques minutes suffit. Pour lire la liste plus souvent sans plus de requêtes, mettez-la en cache : `cache: { methods: { "kralove.list": "5m" } }`.

## Limites et erreurs

- L'API lit les événements. En créer un, s'inscrire et publier un message se font sur le site.
- `NOT_FOUND` pour un événement qui n'existe pas.
- `from` dans un autre format que `YYYY-MM-DD` lève `INVALID_ARGUMENT` avant l'envoi.

<!-- exports:start -->
## Référence

Chaque export a sa page dans la [référence](/reference/) :

| Export | À quoi il sert |
| --- | --- |
| [`Kralove`](/reference/kralove/) | Les événements Kralamoure : des rendez-vous que les joueurs organisent pour combattre le Kralamoure. |
| [`KraloveEvent`](/reference/kralove-event/) | Un événement Kralamoure, tel que la liste le renvoie. |
| [`KraloveEventDetail`](/reference/kralove-event-detail/) | Un événement Kralamoure avec ses participants et ses messages. |
| [`KraloveListParams`](/reference/kralove-list-params/) | Filtres de [`Kralove.list`](/reference/kralove/). |
| [`KraloveMessage`](/reference/kralove-message/) | Un message publié sur un événement Kralamoure. |
| [`KraloveParticipant`](/reference/kralove-participant/) | Une personne qui participe à un événement Kralamoure. |
<!-- exports:end -->
