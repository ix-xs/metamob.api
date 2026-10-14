---
title: Tous les exports
description: "Tout ce que le paquet exporte, valeurs et types, avec une ligne sur chacun et la page qui l'explique. Il y a un seul point d'entrée."
---

```ts
import { Metamob, data, urls, isMetamobError } from "@ix-xs/metamob.api";
import type { Monster, OwnQuest, MonsterLike } from "@ix-xs/metamob.api";
```

Le paquet a un seul point d'entrée, `@ix-xs/metamob.api`, pour les modules ES comme pour CommonJS. Tous les types en sont exportés.

## Valeurs

| Export | Ce que c'est | Page |
| --- | --- | --- |
| `Metamob` | Le client | [Configuration](/basics/configuration/) |
| `data` | Les données de référence livrées avec le paquet | [Les données du paquet](/basics/embedded-data/) |
| `Dataset` | La classe de `data` | [Les données du paquet](/basics/embedded-data/) |
| `urls` | Des adresses sur metamob.fr : images et profils | ci-dessous |
| `MetamobError` | La classe de base de toutes les erreurs | [Codes d'erreur](/reference/errors/) |
| `MetamobApiError` | L'API a répondu avec un statut d'erreur | [Codes d'erreur](/reference/errors/#metamobapierror) |
| `MetamobRequestError` | Délai dépassé, échec réseau, annulation, JSON invalide | [Codes d'erreur](/reference/errors/#metamobrequesterror) |
| `MetamobArgumentError` | Refusé avant l'envoi | [Codes d'erreur](/reference/errors/#metamobargumenterror) |
| `isMetamobError` | Garde de type pour les erreurs de la bibliothèque | [Erreurs](/basics/errors/#testing-an-error) |
| `ListRequest` | Ce que renvoie une méthode paginée | [Listes](/basics/lists/) |
| `Page` | Une page d'une liste | [Listes](/basics/lists/#one-page) |
| `MemoryCache` | Le stockage intégré du cache | [Cache](/basics/caching/) |
| `normalizeName` | La comparaison de noms qu'utilise la bibliothèque | [Noms et identifiants](/basics/names-and-ids/#how-a-name-is-matched) |
| `METHODS` | Les 35 points d'accès, par nom de méthode | [Toutes les méthodes](/reference/methods/) |
| `VERSION` | La version du paquet | |

## urls

Construit des adresses à partir de ce que renvoie l'API. Aucune requête n'est faite.

```ts
const monster = await metamob.monsters.get("Tofu Maléfique");

urls.monsterImage(monster); // à partir d'un monstre, d'un avatar ou d'un nom de fichier
urls.questTypeImage("ocre.png"); // à partir d'un type de quête ou d'un nom de fichier
urls.profile("Ix-xs"); // à partir d'un utilisateur ou d'un pseudo
urls.site; // "https://www.metamob.fr"
```

## normalizeName

La comparaison appliquée aux noms : accents retirés, casse ignorée, apostrophes et tirets unifiés, espaces réduits. Utilisez-la pour comparer ce qu'un utilisateur a tapé avec un nom, de la même façon que la bibliothèque.

```ts
normalizeName("Tofu  MALÉFIQUE"); // "tofu malefique"
normalizeName(monsters[0]?.name.fr ?? "") === normalizeName("tofu malefique");
```

## METHODS

Une description de chaque point d'accès, rangée sous le nom de sa méthode. C'est par rapport à elle que les clés de `cache.methods` sont vérifiées.

```ts
METHODS["quests.setMonster"]; // { id, verb: "PATCH", path: "/quests/{slug}/monsters/{monsterId}", scope: "account" }
Object.keys(METHODS).length; // 35
```

## Types du client

| Type | Ce qu'il décrit |
| --- | --- |
| `MetamobOptions` | Les options du client |
| `RequestOptions` | Les options d'un appel |
| `RetryOptions` | `{ attempts, delay, maxDelay }` |
| `CacheOptions`, `CacheStore`, `CacheEntry` | Le cache et son stockage |
| `RateLimitOptions`, `RateLimitState` | Le limiteur et `metamob.rateLimit` |
| `ClientEvents` | Les événements et les données qu'ils transmettent |
| `Duration` | Un nombre de millisecondes ou une chaîne comme `"10m"` |
| `MethodId`, `MethodSpec` | Un nom de méthode, et sa description dans `METHODS` |
| `MetamobErrorCode` | Les codes d'erreur |
| `CollectOptions`, `PageParams` | `{ limit }` de `all()` et `pages()`, `{ limit, offset }` d'une liste |

## Types de ce que vous passez

| Type | Ce qu'il accepte |
| --- | --- |
| `MonsterLike`, `ZoneLike`, `SubzoneLike`, `ServerLike` | Un identifiant, un nom, un objet avec un `id` |
| `GameVersionLike`, `MonsterTypeLike`, `QuestTypeLike` | Un identifiant, un nom, un objet avec un `id` |
| `QuestTemplateLike` | Un identifiant, `{ id }`, `{ questType, gameVersion }` |
| `MonsterHint`, `MonsterSearchOptions` | Ce qui distingue deux monstres du même nom ; les options de `data.searchMonsters()` |
| `MonsterListParams`, `TemplateMonstersParams` | Les filtres de `monsters.list()` et de `questTemplates.monsters()` |
| `SubzoneParams` | `{ zone }` |
| `KraloveListParams` | Les filtres de `kralove.list()` |
| `UserSearchParams`, `PublicQuestParams` | Les filtres de `users.search()` et de `users.quest()` |
| `ConversationListParams`, `MessagesParams` | Les filtres des conversations |
| `OwnQuestMonstersParams`, `MatchesParams`, `QuestZonesParams` | Les filtres de `quests.monsters()`, `quests.matches()`, `quests.zones()` |
| `QuestUpdate`, `TradeOverride`, `MonsterQuantities` | Ce que prennent `quests.update()`, `quests.setTrade()` et `quests.setMonsters()` |

## Types de ce qui revient

| Type | D'où il vient |
| --- | --- |
| `Account` | `me()` |
| `GameVersion`, `Server`, `MonsterType`, `QuestType`, `QuestTemplate` | Les listes de référence |
| `Monster`, `MonsterDetail`, `MonsterReference`, `TemplateMonster` | Les monstres |
| `Zone`, `ZoneDetail`, `Subzone`, `SubzoneRef` | Les zones |
| `KraloveEvent`, `KraloveEventDetail`, `KraloveParticipant`, `KraloveMessage` | Les événements Kralamoure |
| `UserSummary`, `UserProfile`, `Avatar` | Les joueurs |
| `PublicQuest`, `PublicQuestSummary`, `QuestMonster` | Les quêtes publiques |
| `OwnQuest`, `QuestSettings`, `OwnQuestMonster`, `TypeFilter`, `TypeFilters` | Vos quêtes |
| `QuestUpdateResult`, `MonsterQuantityResult`, `MonstersUpdateResult`, `TradeOverrideResult` | Les réponses aux écritures |
| `TradeMatch`, `MatchMonster` | Les correspondances |
| `ZoneProgress`, `SubzoneProgress`, `ZoneProgressMonster` | La progression par zone |
| `Conversation`, `ConversationItem`, `ConversationMessage`, `TradeProposal`, `ProposalMonster` | Les conversations |
| `LocalizedName`, `Language` | `{ fr, en, es }` et ses clés |
| `QuestBase`, `QuestTemplateRef`, `QuestTypeRef`, `TemplateHeader` | Les parties communes aux types ci-dessus |

Les classes des ressources sont aussi exportées comme types, pour annoter un paramètre : `Quests`, `Monsters`, `Zones`, `Users`, `Conversations`, `Kralove`, `GameVersions`, `Servers`, `MonsterTypes`, `QuestTypes`, `QuestTemplates`.

## Les noms comme types

Les noms connus au moment où le paquet a été construit sont des types littéraux. C'est grâce à eux que votre éditeur complète `"Tofu Maléfique"`.

| Type | Valeurs |
| --- | --- |
| `MonsterNameFr`, `MonsterNameEn`, `MonsterNameEs` | Les noms des monstres |
| `ZoneNameFr`, `ZoneNameEn`, `ZoneNameEs` | Les noms des zones |
| `SubzoneNameFr`, `SubzoneNameEn`, `SubzoneNameEs` | Les noms des sous-zones |
| `MonsterTypeNameFr`, `MonsterTypeNameEn`, `MonsterTypeNameEs` | Les types de monstres |
| `QuestTypeNameFr`, `QuestTypeNameEn`, `QuestTypeNameEs`, `QuestTypeSlug` | Les types de quêtes |
| `ServerName`, `GameVersionName` | Les serveurs et les versions du jeu |
| `QuestTemplateId` | Les identifiants des modèles de quête |

```ts
function isArchmonsterName(name: MonsterNameFr) {
  return data.monster(name)?.type?.id === 3;
}

isArchmonsterName("Bouflet le Puéril");
```

## Voir aussi

- [Toutes les méthodes](/reference/methods/)
- [Codes d'erreur](/reference/errors/)
- [Configuration](/basics/configuration/)
- [Environnements d'exécution](/reference/runtimes/)
