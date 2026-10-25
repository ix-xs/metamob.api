---
title: Todas las exportaciones
description: "Todo lo que exporta el paquete, valores y tipos, con una línea sobre cada uno y la página que lo explica. Hay un solo punto de entrada."
---

```ts
import { Metamob, data, urls, isMetamobError } from "@ix-xs/metamob.api";
import type { Monster, OwnQuest, MonsterLike } from "@ix-xs/metamob.api";
```

El paquete tiene un solo punto de entrada, `@ix-xs/metamob.api`, tanto para módulos ES como para CommonJS. Todos los tipos se exportan desde él.

## Valores

| Exportación | Qué es | Página |
| --- | --- | --- |
| `Metamob` | El cliente | [Configuración](/basics/configuration/) |
| `data` | Los datos de referencia que vienen con el paquete | [Los datos del paquete](/basics/embedded-data/) |
| `Dataset` | La clase de `data` | [Los datos del paquete](/basics/embedded-data/) |
| `urls` | Direcciones de metamob.fr: imágenes y perfiles | más abajo |
| `MetamobError` | Clase base de todos los errores | [Códigos de error](/reference/errors/) |
| `MetamobApiError` | La API respondió con un estado de error | [Códigos de error](/reference/errors/#metamobapierror) |
| `MetamobRequestError` | Tiempo de espera agotado, fallo de red, cancelación, JSON no válido | [Códigos de error](/reference/errors/#metamobrequesterror) |
| `MetamobArgumentError` | Rechazada antes de enviarse | [Códigos de error](/reference/errors/#metamobargumenterror) |
| `isMetamobError` | Guarda de tipo para los errores de la biblioteca | [Errores](/basics/errors/#testing-an-error) |
| `ListRequest` | Lo que devuelve un método paginado | [Listas](/basics/lists/) |
| `Page` | Una página de una lista | [Listas](/basics/lists/#one-page) |
| `MemoryCache` | El almacén de caché integrado | [Caché](/basics/caching/) |
| `normalizeName` | La comparación de nombres que usa la biblioteca | [Nombres e identificadores](/basics/names-and-ids/#how-a-name-is-matched) |
| `METHODS` | Los 38 endpoints, por nombre de método | [Todos los métodos](/reference/methods/) |
| `VERSION` | La versión del paquete | |

## urls

Construye direcciones a partir de lo que devuelve la API. No se envía ninguna solicitud.

```ts
const monster = await metamob.monsters.get("Tofu Maléfique");

urls.monsterImage(monster); // a partir de un monstruo, un avatar o un nombre de archivo
urls.questTypeImage("ocre.png"); // a partir de un tipo de misión o un nombre de archivo
urls.profile("Ix-xs"); // a partir de un usuario o un nombre de usuario
urls.site; // "https://www.metamob.fr"
```

## normalizeName

La comparación que se aplica a los nombres: sin acentos, sin distinguir mayúsculas, con apóstrofos y guiones unificados y espacios reducidos a uno. Úsala para comparar lo que escribió un usuario con un nombre tal como lo hace la biblioteca.

```ts
normalizeName("Tofu  MALÉFIQUE"); // "tofu malefique"
normalizeName(monsters[0]?.name.fr ?? "") === normalizeName("tofu malefique");
```

## METHODS

Una descripción de cada endpoint, indexada por el nombre de su método. Con ella se comprueban las entradas de `cache.methods`.

```ts
METHODS["quests.setMonster"]; // { id, verb: "PATCH", path: "/quests/{slug}/monsters/{monsterId}", scope: "account" }
Object.keys(METHODS).length; // 38
```

## Tipos del cliente

| Tipo | Lo que describe |
| --- | --- |
| `MetamobOptions` | Opciones del cliente |
| `RequestOptions` | Opciones de una llamada |
| `RetryOptions` | `{ attempts, delay, maxDelay }` |
| `CacheOptions`, `CacheStore`, `CacheEntry` | La caché y su almacén |
| `RateLimitOptions`, `RateLimitState` | El limitador y `metamob.rateLimit` |
| `ClientEvents` | Los eventos y sus datos |
| `Duration` | Un número de milisegundos o una cadena como `"10m"` |
| `MethodId`, `MethodSpec` | Un nombre de método, y su descripción en `METHODS` |
| `MetamobErrorCode` | Los códigos de error |
| `CollectOptions`, `PageParams` | `{ limit }` de `all()` y `pages()`, `{ limit, offset }` de una lista |

## Tipos de lo que pasas

| Tipo | Lo que acepta |
| --- | --- |
| `MonsterLike`, `ZoneLike`, `SubzoneLike`, `ServerLike` | Un identificador, un nombre, un objeto con un `id` |
| `GameVersionLike`, `MonsterTypeLike`, `QuestTypeLike` | Un identificador, un nombre, un objeto con un `id` |
| `QuestTemplateLike` | Un identificador, `{ id }`, `{ questType, gameVersion }` |
| `MonsterHint`, `MonsterSearchOptions` | La indicación que distingue dos monstruos del mismo nombre; opciones de `data.searchMonsters()` |
| `MonsterListParams`, `TemplateMonstersParams` | Filtros de `monsters.list()` y `questTemplates.monsters()` |
| `SubzoneParams` | `{ zone }` |
| `KraloveListParams` | Filtros de `kralove.list()` |
| `UserSearchParams`, `PublicQuestParams` | Filtros de `users.search()` y `users.quest()` |
| `ConversationListParams`, `MessagesParams` | Filtros de las conversaciones |
| `TradeProposalListParams` | Filtros de `tradeProposals.list()` |
| `OwnQuestMonstersParams`, `MatchesParams`, `QuestZonesParams` | Filtros de `quests.monsters()`, `quests.matches()`, `quests.zones()` |
| `QuestUpdate`, `TradeOverride`, `MonsterQuantities` | Lo que reciben `quests.update()`, `quests.setTrade()` y `quests.setMonsters()` |

## Tipos de lo que vuelve

| Tipo | De dónde viene |
| --- | --- |
| `Account` | `me()` |
| `GameVersion`, `Server`, `MonsterType`, `QuestType`, `QuestTemplate` | Las listas de referencia |
| `Monster`, `MonsterDetail`, `MonsterReference`, `TemplateMonster` | Monstruos |
| `Zone`, `ZoneDetail`, `Subzone`, `SubzoneRef` | Zonas |
| `KraloveEvent`, `KraloveEventDetail`, `KraloveParticipant`, `KraloveMessage` | Eventos Kralamar |
| `UserSummary`, `UserProfile`, `Avatar` | Jugadores |
| `PublicQuest`, `PublicQuestSummary`, `QuestMonster` | Misiones públicas |
| `OwnQuest`, `QuestSettings`, `OwnQuestMonster`, `TypeFilter`, `TypeFilters` | Tus misiones |
| `QuestUpdateResult`, `MonsterQuantityResult`, `MonstersUpdateResult`, `TradeOverrideResult` | Respuestas a las escrituras |
| `TradeMatch`, `MatchMonster` | Coincidencias |
| `ZoneProgress`, `SubzoneProgress`, `ZoneProgressMonster` | Progreso por zona |
| `Conversation`, `ConversationItem`, `ConversationMessage`, `ConversationProposal`, `MarkAsReadResult` | Conversaciones |
| `TradeProposal`, `TradeProposalDetail`, `ProposalMonster`, `ProposalMonsterDetail`, `ProposalQuest`, `ProposalQuestTemplate` | Propuestas de intercambio |
| `LocalizedName`, `Language` | `{ fr, en, es }` y sus claves |
| `QuestBase`, `QuestTemplateRef`, `QuestTypeRef`, `TemplateHeader` | Partes compartidas por los tipos anteriores |

Las clases de los recursos también se exportan como tipos, para anotar un parámetro: `Quests`, `Monsters`, `Zones`, `Users`, `Conversations`, `TradeProposals`, `Kralove`, `GameVersions`, `Servers`, `MonsterTypes`, `QuestTypes`, `QuestTemplates`.

## Los nombres como tipos

Los nombres conocidos cuando se construyó el paquete son tipos literales. Gracias a ellos tu editor completa `"Tofu Maléfique"`.

| Tipo | Valores |
| --- | --- |
| `MonsterNameFr`, `MonsterNameEn`, `MonsterNameEs` | Nombres de monstruos |
| `ZoneNameFr`, `ZoneNameEn`, `ZoneNameEs` | Nombres de zonas |
| `SubzoneNameFr`, `SubzoneNameEn`, `SubzoneNameEs` | Nombres de subzonas |
| `MonsterTypeNameFr`, `MonsterTypeNameEn`, `MonsterTypeNameEs` | Tipos de monstruo |
| `QuestTypeNameFr`, `QuestTypeNameEn`, `QuestTypeNameEs`, `QuestTypeSlug` | Tipos de misión |
| `ServerName`, `GameVersionName` | Servidores y versiones del juego |
| `QuestTemplateId` | Identificadores de las plantillas de misión |

```ts
function isArchmonsterName(name: MonsterNameFr) {
  return data.monster(name)?.type?.id === 3;
}

isArchmonsterName("Bouflet le Puéril");
```

## Ver también

- [Todos los métodos](/reference/methods/)
- [Códigos de error](/reference/errors/)
- [Configuración](/basics/configuration/)
- [Entornos de ejecución](/reference/runtimes/)
