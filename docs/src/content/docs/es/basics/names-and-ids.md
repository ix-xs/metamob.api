---
title: Nombres e identificadores
description: "Los monstruos, las zonas, los servidores y el resto se designan por su identificador, su nombre o un objeto. Lo que se acepta, y lo que ocurre cuando un nombre es desconocido."
sidebar:
  order: 1
---

Un monstruo se puede dar por su identificador o por su nombre, en uno de los tres idiomas del sitio:

```ts
await metamob.monsters.get(21);
await metamob.monsters.get("Tofu Maléfique");
await metamob.monsters.get("tofu malefique"); // los acentos y las mayúsculas no importan
await metamob.monsters.get("Evil Tofu"); // inglés
await metamob.monsters.get("Tofu maléfico"); // español
```

## Lo que se puede designar por su nombre

| Qué | Se acepta | Dónde |
| --- | --- | --- |
| Un monstruo | identificador, nombre en francés, en inglés o en español, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| Una zona | identificador, nombre en los tres idiomas, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| Una subzona | identificador, nombre en los tres idiomas, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| Un servidor | identificador, nombre, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| Un tipo de monstruo | 1, 2, 3, o `monstre`, `boss`, `archimonstre` y sus traducciones | todos los filtros `type` |
| Una versión del juego | identificador, nombre, `{ id }` | `gameVersions.get`, la indicación `gameVersion` |
| Un tipo de misión | identificador, slug (`ocre`, `dokille`), nombre | `questTypes.get` |
| Una plantilla de misión | identificador, `{ id }`, o `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

Una misión se designa siempre por su slug y un jugador por su nombre de usuario: son cadenas que la API toma tal cual.

Tu editor completa los nombres. Son tipos literales, generados a partir de los datos del paquete, y cualquier otra cadena se sigue aceptando.

## Pasar un objeto

Un objeto con un `id` numérico también sirve: el resultado de una llamada se puede pasar tal cual a la siguiente.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## Cómo se compara un nombre

Un nombre se compara después de quitar los acentos, sin tener en cuenta las mayúsculas, tratando todos los tipos de apóstrofo y de guion como uno solo, y reduciendo los espacios seguidos. `"TOFU  MALEFIQUE"` y `"Tofu Maléfique"` son el mismo nombre. No se perdona nada más: una letra que falta da otro nombre.

La búsqueda se hace en los datos incluidos en el paquete, sin solicitud. Una cadena formada solo por cifras, como `"21"`, se lee como un identificador.

## Cuando un nombre es desconocido

Un nombre que no está en el paquete puede ser más reciente que el paquete. La biblioteca pregunta entonces a la API una vez, con una búsqueda. Si la API tampoco lo conoce, la llamada lanza un `MetamobArgumentError` con el código `UNKNOWN_NAME` y los nombres más parecidos.

```ts
try {
  await metamob.quests.setMonster(slug, "Tofu Malefik", 1);
} catch (error) {
  if (error instanceof MetamobArgumentError) {
    error.code; // "UNKNOWN_NAME"
    error.message; // Unknown monster "Tofu Malefik". Did you mean "Tofu Maléfique"?
    error.suggestions; // ["Tofu Maléfique"]
  }
}
```

En ese caso, no se envía nada a la API.

Para ofrecer sugerencias tú mismo, antes de cualquier llamada:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // los monstruos cuyo nombre contiene "tofu"
```

## Los monstruos que comparten nombre

Seis pares de monstruos, sobre todo archimonstruos, comparten un nombre en al menos un idioma, en dos versiones del juego, con dos identificadores distintos. «Crognan le Barbare» es un monstruo en Dofus (Unity) y otro en Dofus Retro y Dofus Touch.

Cuando escribes en una misión, la misión decide. La biblioteca lee una vez la plantilla que sigue la misión, y toma el monstruo de esa plantilla.

```ts
// El «Crognan le Barbare» correcto para esta misión, sea cual sea su versión del juego.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

En los demás casos, indica cuál quieres:

```ts
const name = "Crognan le Barbare";

const unity = await metamob.monsters.get(name, { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get(name, { gameVersion: "Dofus Touch" });

// O por plantilla de misión.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get(name, { template: ochreOnRetro });
```

Sin indicación, se devuelve el monstruo de la plantilla de misión con el identificador más bajo. `data.monstersNamed(name)` lista todos los monstruos que responden a un nombre.

## Las subzonas y su zona

La API pide la zona de una subzona para leerla. Cuando la subzona está en el paquete, la biblioteca encuentra su zona:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Una subzona añadida al juego después de la publicación del paquete aún no está en él: da su zona.

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`normalizeName`](/reference/normalize-name/) | La forma en la que se comparan los nombres: sin acentos, en minúsculas, un solo tipo de apóstrofo y de guion, espacios simples. |
| [`GameVersionLike`](/reference/game-version-like/) | Una versión del juego: su identificador, su nombre, o un objeto con su `id`. |
| [`MonsterLike`](/reference/monster-like/) | Un monstruo: su identificador, su nombre en francés, inglés o español, o un objeto con su `id`. |
| [`MonsterTypeLike`](/reference/monster-type-like/) | Un tipo de monstruo: su identificador (1, 2, 3), su nombre en francés, inglés o español, o un objeto con su `id`. |
| [`QuestTemplateLike`](/reference/quest-template-like/) | Una plantilla de misión: su identificador, un objeto con su `id`, o el tipo de misión y la versión del juego a la que corresponde. |
| [`QuestTypeLike`](/reference/quest-type-like/) | Un tipo de misión: su identificador, su slug (`ocre`, `dokille`), su nombre, o un objeto con su `id`. |
| [`ServerLike`](/reference/server-like/) | Un servidor: su identificador, su nombre, o un objeto con su `id`. |
| [`SubzoneLike`](/reference/subzone-like/) | Una subzona: su identificador, su nombre en francés, inglés o español, o un objeto con su `id`. |
| [`ZoneLike`](/reference/zone-like/) | Una zona: su identificador, su nombre en francés, inglés o español, o un objeto con su `id`. |
| [`GameVersionName`](/reference/game-version-name/), [`MonsterNameEn`](/reference/monster-name-en/), [`MonsterNameEs`](/reference/monster-name-es/), [`MonsterNameFr`](/reference/monster-name-fr/), [`MonsterTypeNameEn`](/reference/monster-type-name-en/), [`MonsterTypeNameEs`](/reference/monster-type-name-es/), [`MonsterTypeNameFr`](/reference/monster-type-name-fr/), [`QuestTemplateId`](/reference/quest-template-id/), [`QuestTypeNameEn`](/reference/quest-type-name-en/), [`QuestTypeNameEs`](/reference/quest-type-name-es/), [`QuestTypeNameFr`](/reference/quest-type-name-fr/), [`QuestTypeSlug`](/reference/quest-type-slug/), [`ServerName`](/reference/server-name/), [`SubzoneNameEn`](/reference/subzone-name-en/), [`SubzoneNameEs`](/reference/subzone-name-es/), [`SubzoneNameFr`](/reference/subzone-name-fr/), [`ZoneNameEn`](/reference/zone-name-en/), [`ZoneNameEs`](/reference/zone-name-es/), [`ZoneNameFr`](/reference/zone-name-fr/) | Los nombres que conoce el paquete, un tipo por idioma: monstruos, zonas, subzonas, tipos de monstruo y de misión, servidores, versiones del juego. |
<!-- exports:end -->
