---
title: Todas las exportaciones
description: "Todo lo que exporta el paquete, valores y tipos."
---

El paquete tiene un solo punto de entrada, `@ix-xs/metamob.api`, tanto para los módulos ES como para CommonJS. Los tipos también se exportan desde él:

```ts
import { Metamob, data, urls, isMetamobError } from "@ix-xs/metamob.api";
import type { Monster, OwnQuest, MonsterLike } from "@ix-xs/metamob.api";
```

## Valores

| Exportación | Qué es | Página |
| --- | --- | --- |
| `Metamob` | El cliente | [Configuración](/basics/configuration/) |
| `data` | Los datos de referencia que vienen con el paquete | [Los datos del paquete](/basics/embedded-data/) |
| `Dataset` | La clase de `data` | [Los datos del paquete](/basics/embedded-data/) |
| `urls` | Direcciones en metamob.fr: imágenes y perfiles | más abajo |
| `MetamobError` | La clase base de todos los errores | [Códigos de error](/reference/errors/) |
| `MetamobApiError` | La API respondió con un estado de error | [Códigos de error](/reference/errors/#metamobapierror) |
| `MetamobRequestError` | Tiempo agotado, fallo de red, cancelación, JSON no válido | [Códigos de error](/reference/errors/#metamobrequesterror) |
| `MetamobArgumentError` | Rechazado antes del envío | [Códigos de error](/reference/errors/#metamobargumenterror) |
| `isMetamobError` | Guarda de tipo para los errores de la biblioteca | [Errores](/basics/errors/#testing-an-error) |
| `ListRequest` | Lo que devuelve un método paginado | [Listas](/basics/lists/) |
| `Page` | Una página de una lista | [Listas](/basics/lists/#one-page) |
| `MemoryCache` | El almacenamiento integrado de la caché | [Caché](/basics/caching/) |
| `normalizeName` | La comparación de nombres que usa la biblioteca | [Nombres e identificadores](/basics/names-and-ids/#how-a-name-is-matched) |
| `METHODS` | Los 40 puntos de acceso, por nombre de método | [Todos los métodos](/reference/methods/) |
| `VERSION` | La versión del paquete | |

## urls

Construye direcciones en metamob.fr a partir de lo que devuelve la API, sin solicitud:

```ts
const monster = await metamob.monsters.get("Tofu Maléfique");

urls.monsterImage(monster); // a partir de un monstruo, un avatar o un nombre de archivo
urls.questTypeImage("ocre.png"); // a partir de un tipo de misión o un nombre de archivo
urls.profile("Ix-xs"); // a partir de un usuario o un nombre de usuario
urls.site; // "https://www.metamob.fr"
```

## normalizeName

La comparación que se aplica a los nombres: acentos quitados, mayúsculas ignoradas, apóstrofos y guiones unificados, espacios reducidos. Sirve para comparar un texto escrito con un nombre, como hace la biblioteca:

```ts
normalizeName("Tofu  MALÉFIQUE"); // "tofu malefique"
normalizeName(monsters[0]?.name.fr ?? "") === normalizeName("tofu malefique");
```

## METHODS

La descripción de cada punto de acceso, bajo el nombre de su método. Las claves de `cache.methods` se comprueban contra ella.

```ts
METHODS["quests.setMonster"].path; // "/quests/{slug}/monsters/{monsterId}"
Object.keys(METHODS).length; // 40
```

## Tipos del cliente

| Tipo | Lo que describe |
| --- | --- |
| `MetamobOptions` | Las opciones del cliente |
| `RequestOptions` | Las opciones de una llamada |
| `RetryOptions` | `{ attempts, delay, maxDelay }` |
| `CacheOptions`, `CacheStore`, `CacheEntry` | La caché y su almacenamiento |
| `RateLimitOptions`, `RateLimitState` | El limitador y `metamob.rateLimit` |
| `ClientEvents` | Los eventos y los datos que transmiten |
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
| `MonsterHint`, `MonsterSearchOptions` | Lo que distingue dos monstruos con el mismo nombre; las opciones de `data.searchMonsters()` |
| `MonsterListParams`, `TemplateMonstersParams` | Los filtros de `monsters.list()` y de `questTemplates.monsters()` |
| `SubzoneParams` | `{ zone }` |
| `KraloveListParams` | Los filtros de `kralove.list()` |
| `UserSearchParams`, `PublicQuestParams` | Los filtros de `users.search()` y de `users.quest()` |
| `ConversationListParams`, `MessagesParams` | Los filtros de las conversaciones |
| `TradeProposalListParams`, `NewTradeProposal` | Los filtros de `tradeProposals.list()`, lo que toma `tradeProposals.create()` |
| `OwnQuestMonstersParams`, `MatchesParams`, `QuestZonesParams` | Los filtros de `quests.monsters()`, `quests.matches()`, `quests.zones()` |
| `QuestUpdate`, `TradeOverride`, `MonsterQuantities` | Lo que toman `quests.update()`, `quests.setTrade()` y `quests.setMonsters()` |

## Tipos de lo que vuelve

| Tipo | De dónde viene |
| --- | --- |
| `Account` | `me()` |
| `GameVersion`, `Server`, `MonsterType`, `QuestType`, `QuestTemplate` | Las listas de referencia |
| `Monster`, `MonsterDetail`, `MonsterReference`, `TemplateMonster` | Los monstruos |
| `Zone`, `ZoneDetail`, `Subzone`, `SubzoneRef` | Las zonas |
| `KraloveEvent`, `KraloveEventDetail`, `KraloveParticipant`, `KraloveMessage` | Los eventos Kralamar |
| `UserSummary`, `UserProfile`, `Avatar` | Los jugadores |
| `PublicQuest`, `PublicQuestSummary`, `QuestMonster` | Las misiones públicas |
| `OwnQuest`, `QuestSettings`, `OwnQuestMonster`, `TypeFilter`, `TypeFilters` | Tus misiones |
| `QuestUpdateResult`, `MonsterQuantityResult`, `MonstersUpdateResult`, `TradeOverrideResult` | Las respuestas a las escrituras |
| `TradeMatch`, `MatchMonster` | Las coincidencias |
| `ZoneProgress`, `SubzoneProgress`, `ZoneProgressMonster` | El progreso por zona |
| `Conversation`, `ConversationItem`, `ConversationMessage`, `ConversationProposal`, `MarkAsReadResult` | Las conversaciones |
| `TradeProposal`, `TradeProposalDetail`, `ProposalMonster`, `ProposalMonsterDetail`, `ProposalQuest`, `ProposalQuestTemplate` | Las propuestas de intercambio |
| `LocalizedName`, `Language` | `{ fr, en, es }` y sus claves |
| `QuestBase`, `QuestTemplateRef`, `QuestTypeRef`, `TemplateHeader` | Las partes comunes a los tipos de arriba |

Las clases de los recursos también se exportan como tipos, para anotar un parámetro: `Quests`, `Monsters`, `Zones`, `Users`, `Conversations`, `TradeProposals`, `Kralove`, `GameVersions`, `Servers`, `MonsterTypes`, `QuestTypes`, `QuestTemplates`.

## Los nombres como tipos

Los nombres conocidos en la publicación del paquete también son tipos literales: es lo que permite a tu editor completar `"Tofu Maléfique"`.

| Tipo | Valores |
| --- | --- |
| `MonsterNameFr`, `MonsterNameEn`, `MonsterNameEs` | Los nombres de los monstruos |
| `ZoneNameFr`, `ZoneNameEn`, `ZoneNameEs` | Los nombres de las zonas |
| `SubzoneNameFr`, `SubzoneNameEn`, `SubzoneNameEs` | Los nombres de las subzonas |
| `MonsterTypeNameFr`, `MonsterTypeNameEn`, `MonsterTypeNameEs` | Los tipos de monstruo |
| `QuestTypeNameFr`, `QuestTypeNameEn`, `QuestTypeNameEs`, `QuestTypeSlug` | Los tipos de misión |
| `ServerName`, `GameVersionName` | Los servidores y las versiones del juego |
| `QuestTemplateId` | Los identificadores de las plantillas de misión |

```ts
function isArchmonsterName(name: MonsterNameFr) {
  return data.monster(name)?.type?.id === 3;
}

isArchmonsterName("Bouflet le Puéril");
```
