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

## Référence

| Méthode | Renvoie |
| --- | --- |
| `kralove.list({ server, from }, options?)` | `KraloveEvent[]` |
| `kralove.get(id, options?)` | `KraloveEventDetail` |

Un événement :

| Champ | Type | Signification |
| --- | --- | --- |
| `id` | `number` | |
| `event_datetime` | `string` | Quand, en date ISO 8601 UTC : `2026-01-27T20:00:00Z` |
| `description` | `string` | Ce que l'organisateur a écrit |
| `creator` | `string \| null` | L'organisateur |
| `server` | `Server \| null` | Où |
| `participants_count`, `character_count`, `messages_count` | `number` | Seulement avec `list()` |
| `participants` | `{ username, character_count }[]` | Seulement avec `get()` |
| `messages` | `{ username, content, created_at }[]` | Seulement avec `get()` |
