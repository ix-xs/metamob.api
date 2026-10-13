---
title: Événements Kralamoure
description: Ouvrir l'antre du Kralamoure Géant demande beaucoup de monde, alors les joueurs s'organisent sur Metamob. Lisez les prochains événements d'un serveur, qui s'est inscrit et ce qui s'est dit.
sidebar:
  order: 8
---

```ts
const events = await metamob.kralove.list({ server: "Draconiros" });

for (const event of events) {
  console.log(event.event_datetime, `${event.character_count} characters signed up`);
}
```

## Lister les événements

Sans filtre, `kralove.list()` renvoie les événements à partir d'aujourd'hui, sur tous les serveurs. Les événements passés sont laissés de côté, sauf si vous demandez à partir d'un jour antérieur.

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
  console.log(`${event.messages_count} messages, organised by ${event.creator ?? "a deleted account"}`);
}
```

## Lire un événement

`kralove.get()` ajoute les participants et les messages. Elle prend l'identifiant de l'événement, ou l'événement lui-même.

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const event = await metamob.kralove.get(next);

  for (const participant of event.participants) {
    console.log(participant.username ?? "a deleted account", `x${participant.character_count}`);
  }
  for (const message of event.messages) {
    console.log(`${message.username ?? "a deleted account"}: ${message.content}`);
  }
}
```

## Les noms manquants

`creator`, ainsi que le `username` d'un participant ou d'un message, peuvent valoir `null`. Cela arrive quand le compte a été supprimé définitivement, ou quand ce joueur et vous vous êtes bloqués l'un l'autre. Prévoyez ce cas partout où vous affichez un nom.

Comme un blocage change la réponse d'une clé à l'autre, les événements ne sont pas mis en cache par défaut.

## Annoncer la prochaine ouverture

```ts
const [next] = await metamob.kralove.list({ server: "Draconiros" });

if (next) {
  const when = new Date(next.event_datetime.replace(" ", "T"));
  await notify(`Kralamoure on ${when.toLocaleString("fr-FR")}: ${next.character_count} characters so far.`);
}
```

Vérifier une fois toutes les quelques minutes suffit largement. Pour vérifier plus souvent sans faire plus de requêtes, mettez la liste en cache : `cache: { methods: { "kralove.list": "5m" } }`.

## Limites et erreurs

- L'API lit les événements. En créer un, s'inscrire et publier un message se font sur le site.
- `NOT_FOUND` pour un événement qui n'existe pas.
- `from` dans un autre format que `YYYY-MM-DD` lève `INVALID_ARGUMENT` avant qu'une requête soit dépensée.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `kralove.list({ server, from }, options?)` | `KraloveEvent[]` |
| `kralove.get(id, options?)` | `KraloveEventDetail` |

Un événement :

| Champ | Type | Signification |
| --- | --- | --- |
| `id` | `number` | |
| `event_datetime` | `string` | Quand, au format `YYYY-MM-DD HH:mm:ss` |
| `description` | `string` | Ce que l'organisateur a écrit |
| `creator` | `string \| null` | L'organisateur |
| `server` | `Server \| null` | Où |
| `participants_count`, `character_count`, `messages_count` | `number` | Seulement avec `list()` |
| `participants` | `{ username, character_count }[]` | Seulement avec `get()` |
| `messages` | `{ username, content, created_at }[]` | Seulement avec `get()` |

## Voir aussi

- [Données de référence](/resources/reference-data/)
- [Cache](/basics/caching/)
- [Noms et identifiants](/basics/names-and-ids/)
- [Autres joueurs](/resources/users/)
