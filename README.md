# ![Metamob](https://metamob.fr/img/pierre_dame_small.png) [Metamob](https://metamob.fr)

<img align=right src="https://metamob.fr/img/ocre.png">
<div>
    <div>
        <h3>Complétez votre quête du Dofus Ocre</h3>
        <p>Suivez votre progression dans la quête de l'Ocre, gérez votre inventaire de monstres et échangez avec la communauté pour compléter votre collection.</p>
        <p>Compatible avec Dofus Unity, Dofus Retro et Dofus Touch</p>
    </div>
</div>

<br>
<br>

<div align="center">

![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

[![npm version](https://badge.fury.io/js/%40ix-xs%2Fmetamob.api.svg)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![Downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg)](https://www.npmjs.com/package/@ix-xs/metamob.api)

</div>
<br>

# @ix-xs/metamob.api

Client Node.js **complet** et **typé (JSDoc)** pour l'[API Metamob](https://www.metamob.fr/help/api) (Dofus).
Couvre l'intégralité des endpoints publics : versions du jeu, serveurs, kralamoures, utilisateurs,
monstres, types de monstres, modèles de quête, zones/sous-zones, conversations et **gestion de vos quêtes**.

- ✅ Tous les endpoints de l'API v1
- ✅ Résolution automatique **id ↔ nom** (fr/en/es) grâce à un cache local embarqué
- ✅ Réponses normalisées et uniformes (jamais d'exception réseau non gérée)
- ✅ IntelliSense complet en JSDoc (VS Code) - aucune compilation requise

## Installation

```bash
npm install @ix-xs/metamob.api
```

## Démarrage rapide

```js
const MetamobAPI = require("@ix-xs/metamob.api");

const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });

const servers = await client.getServers();

if (servers.ok) {
  console.log(servers.data); // [{ id, name, community, game_version }, ...]
} else {
  console.error(servers.status, servers.error);
}
```

> ⚠️ **Ne codez jamais votre clé API en dur** et ne la commitez pas. Utilisez une variable
> d'environnement (`METAMOB_API_KEY`) ou un fichier `.env` ignoré par git.
> Générez votre clé dans *Paramètres → Clé API* sur metamob.fr.

## Forme des réponses

Toutes les méthodes renvoient une `Promise` résolue vers un objet uniforme :

```js
// Succès
{ ok: true, status: 200, statusText: "OK", data: /* ... */, pagination?: { total, limit, offset } }

// Échec (HTTP >= 400, ou erreur réseau)
{ ok: false, status: 429, statusText: "Too Many Requests", error: "...", retryAfter?: 30 }
```

Les méthodes ne *rejettent* jamais pour une erreur HTTP ou réseau : vérifiez toujours `result.ok`.
Elles *lèvent* uniquement en cas de mauvais usage (paramètre invalide, id/nom introuvable dans le cache).

## Cache local

Un cache embarqué (`client.cache`) expose les données de référence, avec les relations déjà résolues
(un monstre porte son `type`, une zone ses `subzones`, etc.). Idéal pour convertir un nom en id sans
appel réseau :

```js
client.cache.zones;         // toutes les zones + leurs sous-zones
client.cache.monsters;      // tous les monstres + leur type (+ référence pour les archimonstres)
client.cache.servers;       // serveurs + version du jeu
client.cache.monster_types; // types de monstres
```

Partout où un paramètre s'appelle `idOrName`, vous pouvez passer **soit l'id numérique, soit le nom**
(français, anglais ou espagnol, insensible à la casse et aux accents).

## Clé API par requête

La clé fournie au constructeur est utilisée par défaut. **Toutes** les méthodes acceptent en plus
un `api_key` dans leur objet d'options, qui remplace la clé du client **pour cette requête** :

```js
const client = new MetamobAPI({ api_key: DEFAULT_KEY });

// Utilise DEFAULT_KEY
await client.getServers();

// Utilise une autre clé, sans recréer de client
await client.getUser("bob", { api_key: BOB_KEY });
await client.getConversations({ api_key: BOB_KEY });
await client.updateQuest("a1b2c3d4", { current_step: 12 }, { api_key: BOB_KEY });
```

Usage prévu : **agir pour le compte d'un autre utilisateur** qui vous a confié sa clé (par exemple
un bot ou un service qui gère les quêtes de plusieurs joueurs consentants). Un seul client, une clé
différente par utilisateur à chaque appel.

> La limite de 60 req/min imposée par Metamob s'applique **par clé**. Merci de la respecter et de
> ne pas utiliser plusieurs clés dans le seul but de la contourner : cela surcharge le serveur et
> va à l'encontre des conditions d'utilisation de l'API.

## Référence des méthodes

### Données de référence

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `getGameVersions(options?)` | `GET /game-versions` | Liste ou détail (`{ idOrName }`) des versions du jeu |
| `getServers(options?)` | `GET /servers` | Liste ou détail (`{ idOrName }`) des serveurs |
| `getMonsterTypes(options?)` | `GET /monster-types` | Liste ou détail (`{ idOrName }`) des types |
| `getMonsters(options?)` | `GET /monsters` | Liste (`{ query, typeIdOrName, limit, offset }`) ou détail (`{ idOrName }`) |
| `getQuestTemplates(options?)` | `GET /quest-templates` | Liste ou détail (`{ id, step, limit, offset }`) |
| `getZones(options?)` | `GET /zones` | Liste, recherche (`{ query }`) ou détail (`{ idOrName }`) |
| `getSubZones(options)` | `GET /zones/{id}/subzones` | Sous-zones d'une zone (`{ zoneIdOrName, query }`) ou détail (`{ idOrName }`) |
| `getSubZoneMonsters(subzoneIdOrName, options?)` | `GET /zones/{id}/subzones/{sid}/monsters` | Monstres d'une sous-zone |

### Kralamoures & utilisateurs

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `getKraloves(options?)` | `GET /kralove` | Liste (`{ serverIdOrName, from }`) ou détail (`{ id }`) |
| `searchUsers(query, options?)` | `GET /users/search` | Recherche (`{ serverIdOrName, active_within_days, limit, offset }`) |
| `getUser(username, options?)` | `GET /users/{username}` | Profil public |
| `getUserQuests(username, options?)` | `GET /users/{username}/quests` | Liste des quêtes, ou détail (`{ slug, ... }`) |

### Conversations

Ces endpoints sont liés au compte de la clé utilisée. Passez `options.api_key` pour cibler
un autre utilisateur que celui du client (voir [Clé API par requête](#clé-api-par-requête)).

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `getConversations(options?)` | `GET /conversations` | Liste des conversations (`{ status, limit, offset, api_key }`) |
| `getMessages(username, options?)` | `GET /conversations/{username}` | Messages (pagination par curseur `{ limit, before_id, api_key }`) |

### Gestion de vos quêtes

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `getQuest(slug, options?)` | `GET /quests/{slug}` | Lire les réglages complets de **sa propre** quête (trade_mode, seuils, type_filters, is_favorite…) |
| `updateQuest(slug, changes, options?)` | `PATCH /quests/{slug}` | Modifier les paramètres d'une quête |
| `updateQuestMonster(slug, monsterIdOrName, quantity, options?)` | `PATCH /quests/{slug}/monsters/{id}` | Modifier la quantité d'un monstre |
| `updateQuestMonsters(slug, monsters, options?)` | `PATCH /quests/{slug}/monsters` | Modifier plusieurs monstres (max 200) |
| `setQuestMonsterTrade(slug, monsterIdOrName, trade, options?)` | `PATCH /quests/{slug}/monsters/{id}/trade` | Forcer les quantités de trade |
| `getQuestMatches(slug, options?)` | `GET /quests/{slug}/matches` | Partenaires d'échange potentiels |
| `getQuestZones(slug, options?)` | `GET /quests/{slug}/zones` | Progression par zones |

## Exemples complets

### Initialisation & gestion d'erreur

```js
const MetamobAPI = require("@ix-xs/metamob.api");
const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });

const res = await client.getServers();
if (!res.ok) {
  // Erreur HTTP/réseau : jamais d'exception, on lit res.status / res.error
  console.error(`Erreur ${res.status} : ${res.error}`);
} else {
  for (const s of res.data) console.log(`${s.id} — ${s.name} (${s.community})`);
}
```

### Données de référence via le cache (zéro requête réseau)

```js
// Convertir un nom en id, sans appel réseau
const amaknaId = client.cache.zones.find(z => z.name.fr === "Amakna")?.id;

// Tous les archimonstres (type 3), avec leur monstre de référence déjà résolu
const archis = client.cache.monsters.filter(m => m.type?.id === 3);
console.log(archis[0]);
// { id, name: { fr, en, es }, image, level_min, level_max, type: {...}, reference: {...} }
```

### Explorer zones → sous-zones → monstres

```js
const amakna = await client.getZones({ idOrName: "Amakna" });
console.log(amakna.data.subzones.map(sz => sz.name.fr));

const monsters = await client.getSubZoneMonsters("Cimetière");
console.log(monsters.data.map(m => m.name.fr));
```

### Rechercher un joueur et lire ses quêtes

```js
const search = await client.searchUsers("player", { serverIdOrName: "Draconiros", limit: 10 });
const username = search.data[0]?.username;

if (username) {
  const quests = await client.getUserQuests(username);
  const slug = quests.data[0]?.slug;

  // Monstres recherchés de la première quête (paginé)
  const detail = await client.getUserQuests(username, { slug, status: "wanted", limit: 50 });
  console.log(detail.data.monsters);
  // [{ id, name, image, level_min, level_max, type, step, quantity, offer, want }, ...]
}
```

### Événements Kralamoure

```js
const events = await client.getKraloves({ serverIdOrName: "Draconiros", from: "2026-07-01" });
if (events.data.length) {
  const detail = await client.getKraloves({ id: events.data[0].id });
  console.log(detail.data.participants, detail.data.messages);
}
```

### Conversations & messages (pagination par curseur)

```js
const convos = await client.getConversations();        // du compte lié à la clé du client
const withUser = convos.data[0]?.username;

// Parcourir tout l'historique, du plus récent au plus ancien
let before_id;
do {
  const page = await client.getMessages(withUser, { limit: 50, before_id });
  for (const item of page.data) {
    if (item.kind === "message") console.log(`${item.sender}: ${item.content}`);
    else console.log(`[proposition #${item.id}] ${item.status}`);
  }
  before_id = page.pagination.has_more ? page.pagination.next_before_id : null;
} while (before_id);
```

### Gérer sa propre quête (workflow complet)

```js
const slug = "a1b2c3d4"; // visible dans l'URL de votre page de quête

// 0) Lire les réglages actuels (trade_mode, seuils, type_filters, is_favorite…)
const settings = await client.getQuest(slug);
console.log(settings.data.trade_mode, settings.data.type_filters);

// 1) Réglages de la quête (les never_* peuvent aussi être envoyés via `type_filters`)
await client.updateQuest(slug, { current_step: 12, show_trades: true, trade_mode: 1 });

// 2) Quantité possédée d'un monstre (par id ou par nom)
await client.updateQuestMonster(slug, "Bouftou", 5);

// 3) Mise à jour en lot (max 200 monstres)
await client.updateQuestMonsters(slug, [
  { monster: "Tofu", quantity: 3 },
  { monster: 456, quantity: 0 },
]);

// 4) Surcharge manuelle du trade (null = calcul automatique)
await client.setQuestMonsterTrade(slug, 123, { trade_offer: 1, trade_want: null });
```

### Partenaires d'échange & progression par zones

```js
const matches = await client.getQuestMatches(slug, { limit: 10, only_possible_trades: true });
for (const m of matches.data) console.log(`${m.user.username} — score ${m.match_score}`);

const progress = await client.getQuestZones(slug, { monsterTypeIdOrName: "archimonstre" });
for (const zone of progress.data) console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);
```

### Multi-utilisateurs : une clé différente par requête

```js
// Un seul client, pour agir au nom de plusieurs joueurs ayant confié leur clé
await client.getUserQuests("alice", { api_key: ALICE_KEY });
await client.updateQuestMonster("z9y8x7w6", "Tofu", 2, { api_key: BOB_KEY });
```

### Parcourir toutes les pages (offset / limit)

```js
async function getAllMonsters() {
  const all = [];
  let offset = 0;
  for (;;) {
    const { data, pagination } = await client.getMonsters({ limit: 200, offset });
    all.push(...data);
    offset += pagination.limit;
    if (offset >= pagination.total) break;
  }
  return all;
}
```

## Limites d'utilisation

L'API Metamob autorise **60 requêtes/minute par clé**. En cas de dépassement, la réponse
porte `status: 429` et, si disponible, `retryAfter` (secondes à attendre). Un petit helper
qui ré-essaie automatiquement :

```js
async function withRetry(fn, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fn();
    if (res.ok || res.status !== 429 || attempt >= retries) return res;
    const waitMs = (res.retryAfter ?? 60) * 1000;
    await new Promise(r => setTimeout(r, waitMs));
  }
}

// Usage
const monsters = await withRetry(() => client.getMonsters({ limit: 200 }));
```

## Types TypeScript

Le code est entièrement documenté en JSDoc : VS Code fournit l'auto-complétion sans configuration.

## Licence

MIT
