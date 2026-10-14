---
title: Nombres e identificadores
description: "Allí donde la API espera un identificador numérico, puedes escribir el nombre, el identificador o pasar el objeto que devolvió otra llamada. Esta página explica lo que se acepta, cómo se comparan los nombres y qué ocurre cuando uno es desconocido."
sidebar:
  order: 1
---

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
| Un monstruo | identificador, nombre en francés, inglés o español, `{ id }` | `monsters.get`, `quests.setMonster`, `quests.setMonsters`, `quests.setTrade` |
| Una zona | identificador, nombre en tres idiomas, `{ id }` | `zones.get`, `zones.subzones`, `quests.zones({ zone })` |
| Una subzona | identificador, nombre en tres idiomas, `{ id }` | `zones.subzone`, `zones.monsters`, `quests.zones({ subzone })` |
| Un servidor | identificador, nombre, `{ id }` | `servers.get`, `kralove.list({ server })`, `users.search(query, { server })` |
| Un tipo de monstruo | 1, 2, 3, o `monstre`, `boss`, `archimonstre` y sus traducciones | todos los filtros `type` |
| Una versión del juego | identificador, nombre, `{ id }` | `gameVersions.get`, la indicación `gameVersion` |
| Un tipo de misión | identificador, slug (`ocre`, `dokille`), nombre | `questTypes.get` |
| Una plantilla de misión | identificador, `{ id }`, o `{ questType, gameVersion }` | `questTemplates.get`, `questTemplates.monsters` |

Una misión se designa siempre por su slug y un jugador por su nombre de usuario: son cadenas que la API toma tal cual.

Tu editor completa los nombres. Son tipos literales, generados a partir de los datos del paquete, y cualquier otra cadena se sigue aceptando.

## Pasar un objeto

Sirve cualquier cosa con un `id` numérico, así que el resultado de una llamada alimenta la siguiente sin tener que extraer el identificador.

```ts
const zone = await metamob.zones.get("Amakna");

for (const subzone of zone.subzones) {
  const found = await metamob.zones.monsters(subzone, { zone });
  console.log(subzone.name.fr, found.length);
}
```

## Cómo se compara un nombre

Un nombre se compara después de quitar los acentos, ignorar las mayúsculas, tratar todos los tipos de apóstrofo y de guion como iguales y reducir los espacios seguidos a uno solo. `"TOFU  MALEFIQUE"` y `"Tofu Maléfique"` son el mismo nombre. No se perdona nada más: una letra que falta es otro nombre.

La búsqueda se hace en los datos que vienen con el paquete, así que no cuesta ninguna solicitud. Una cadena formada solo por cifras, como `"21"`, se lee como un identificador.

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

La escritura nunca se envía: una errata no puede cambiar el monstruo equivocado.

Para ofrecer sugerencias tú mismo, antes de llamar a nada:

```ts
import { data } from "@ix-xs/metamob.api";

data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
data.searchMonsters("tofu", { limit: 5 }); // los monstruos cuyo nombre contiene "tofu"
```

## Monstruos que comparten nombre

Diez archimonstruos tienen el mismo nombre en dos versiones del juego, con dos identificadores distintos. «Crognan le Barbare» es un monstruo en Dofus (Unity) y otro en Dofus Retro y Dofus Touch.

Cuando escribes en una misión, la misión decide. La biblioteca lee qué plantilla sigue la misión, una sola vez, y elige el monstruo de esa plantilla.

```ts
// El «Crognan le Barbare» correcto para esta misión, sea cual sea su versión del juego.
await metamob.quests.setMonster(slug, "Crognan le Barbare", 1);
```

En los demás casos, indica cuál quieres:

```ts
const unity = await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus (Unity)" });
const touch = await metamob.monsters.get("Crognan le Barbare", { gameVersion: "Dofus Touch" });

// O por plantilla de misión.
const ochreOnRetro = { questType: "ocre", gameVersion: "Dofus Retro (1.29)" } as const;
const retro = await metamob.monsters.get("Crognan le Barbare", { template: ochreOnRetro });
```

Sin indicación, se devuelve el monstruo cuya plantilla de misión tiene el identificador más bajo. `data.monstersNamed(name)` da todos los monstruos que responden a un nombre.

## Las subzonas y su zona

La API accede a una subzona a través de su zona. La biblioteca encuentra la zona por ti cuando la subzona está en el paquete:

```ts
const subzone = await metamob.zones.subzone("Coin des Bouftous");
subzone.zone.name.fr; // "Amakna"
```

Una subzona añadida al juego después de publicarse el paquete aún no se conoce, y necesita su zona:

```ts
await metamob.zones.monsters("Coin des Bouftous", { zone: "Amakna" });
```

## Referencia

| Tipo | Acepta |
| --- | --- |
| `MonsterLike` | `number`, un nombre de monstruo, `{ id }` |
| `ZoneLike`, `SubzoneLike` | `number`, un nombre, `{ id }` |
| `ServerLike`, `GameVersionLike` | `number`, un nombre, `{ id }` |
| `MonsterTypeLike` | `number`, un nombre, `{ id }` |
| `QuestTypeLike` | `number`, un slug, un nombre, `{ id }` |
| `QuestTemplateLike` | `number`, `{ id }`, `{ questType, gameVersion }` |
| `MonsterHint` | `{ gameVersion }`, `{ template }` |

## Ver también

- [Los datos del paquete](/basics/embedded-data/)
- [Monstruos](/resources/monsters/)
- [Errores](/basics/errors/)
- [Datos de referencia](/resources/reference-data/)
