---
title: Tus misiones
description: "Leer y modificar las misiones de la cuenta, registrar los monstruos que posees y seguir el progreso por zona."
sidebar:
  order: 2
---

Todos los métodos de `metamob.quests` actúan sobre las misiones de la cuenta de la clave, y solo sobre ellas. Para las misiones de otros jugadores, consulta [Otros jugadores](/resources/users/).

## Listar tus misiones

`quests.list()` devuelve todas las misiones de la cuenta, las favoritas primero, incluidas las que están ocultas en el perfil público. Los demás métodos toman el slug de una de esas misiones.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // ejemplares que reunir de cada monstruo
}
```

Un slug también es la última parte de la dirección de una misión en metamob.fr.

## Leer los ajustes de una misión

`quests.get()` añade lo que solo ve el propietario: el modo de intercambio, sus umbrales y los filtros por tipo de monstruo:

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // visible en el perfil público
quest.trade_mode; // 0 automático, 1 experto
quest.trade_offer_threshold; // modo experto: ofrecer a partir de esta cantidad
quest.type_filters["3"]?.never_want; // no buscar nunca archimonstruos
```

Las claves de `type_filters` son los identificadores de los tipos de monstruo: `"1"` para los monstruos, `"2"` para los jefes, `"3"` para los archimonstruos.

## Modificar los ajustes

`quests.update()` solo toma lo que cambia. La respuesta contiene el slug y los campos modificados:

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Modo de intercambio experto, con sus umbrales.
await metamob.quests.update(slug, {
  trade_mode: 1,
  trade_offer_threshold: 3,
  trade_want_threshold: 1,
});

// No ofrecer nunca archimonstruos, de dos formas.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## Los monstruos de una misión

`quests.monsters()` lista lo que pide la misión, con lo que posees. Es una [lista](/basics/lists/): `await` da una página, `for await` lo recorre todo.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` plantea dos preguntas distintas:

| `status` | Pregunta | Significado |
| --- | --- | --- |
| `needed` | Progreso | Posees menos de los que pide la misión |
| `ok` | Progreso | Posees exactamente los suficientes |
| `excess` | Progreso | Posees ejemplares de sobra |
| `wanted` | Intercambio | La misión lo busca, una vez aplicados tus ajustes de intercambio |
| `offered` | Intercambio | La misión lo ofrece, una vez aplicados tus ajustes de intercambio |

Un monstruo en `excess` no siempre está `offered`: un filtro o un umbral puede retenerlo.

Este `status` es un filtro. Más abajo, dos respuestas también tienen un campo `status`, con otro sentido: un número después de una escritura, y una de tres palabras en el progreso por zona.

```ts
const archmonsters = { type: "archimonstre", status: "needed" } as const;

const toCatch = await metamob.quests.monsters(slug, archmonsters).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const manual = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Registrar un monstruo

`setMonster` fija el número de ejemplares de un monstruo que posees. No es una suma: para añadir uno, lee primero la cantidad actual.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // poseídos menos misiones en paralelo, negativo si faltan
result.effective_offer; // lo que la misión ofrece ahora
result.effective_want; // lo que la misión busca ahora
```

El monstruo es un nombre, un identificador o un objeto, consulta [Nombres e identificadores](/basics/names-and-ids/). Un nombre desconocido lanza `UNKNOWN_NAME`, y no se escribe nada.

## Registrar varios monstruos

`setMonsters` toma un lote, en la forma que más te convenga:

```ts
// Un objeto indexado por nombre.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Una lista, con nombres, identificadores u objetos.
await metamob.quests.setMonsters(slug, [
  { monster: 397, quantity: 1 },
  { monster: "Bouflet le Puéril", quantity: 3 },
]);

// Un Map.
const caught = new Map<string, number>([["Tofu Maléfique", 1]]);
const result = await metamob.quests.setMonsters(slug, caught);
result.updated_count;
```

La API acepta 200 monstruos por solicitud: un lote más largo se envía en varias solicitudes, cuyas respuestas se unen. Todos los nombres se comprueban antes de la primera: si hay una errata, no se escribe nada.

Cuando el mismo monstruo aparece dos veces, gana la última cantidad.

## Progreso por zona

`quests.zones()` ordena una misión según el lugar donde viven los monstruos, las subzonas menos avanzadas primero. Un monstruo aparece en cada subzona donde vive.

```ts
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);

  for (const subzone of zone.subzones) {
    const missing = subzone.monsters
      .filter((monster) => monster.status === "incomplete")
      .map((monster) => monster.name.fr);
    if (missing.length) console.log(`  ${subzone.name.fr}: ${missing.join(", ")}`);
  }
}
```

La respuesta no está paginada y puede ser larga. `zone`, `subzone` y `type` la reducen:

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

Un monstruo está `validated` cuando su etapa ya ha pasado, `completed` cuando posees suficientes, `incomplete` en los demás casos.

## Límites y errores

- Todos los métodos responden `NOT_FOUND` para una misión que no es tuya, exista o no.
- Las cantidades van de 0 a 99. Fuera de ese rango, la API responde `BAD_REQUEST`.
- `current_step` va de 1 a `quest_template.step_count`, más uno para una misión terminada: de 1 a 19 para las 18 etapas del Ocre en Dofus, de 1 a 35 en Retro y Touch. Fuera de ese rango, la API responde `BAD_REQUEST`.
- Un umbral del modo experto va de 0 a 99. Fuera de ese rango, se rechaza antes del envío. Los umbrales solo se guardan en modo experto: en modo automático, un valor válido se acepta pero no se guarda.
- Después de una escritura, la lectura siguiente está al día: la caché de tu clave se olvida.
- La API no crea ni borra misiones: eso se hace en el sitio.

## Referencia

| Método | Devuelve |
| --- | --- |
| `quests.list(options?)` | `OwnQuest[]` |
| `quests.get(slug, options?)` | `QuestSettings` |
| `quests.update(slug, changes, options?)` | `QuestUpdateResult` |
| `quests.monsters(slug, { type, status, trade, step, limit, offset }, options?)` | una lista de `OwnQuestMonster` |
| `quests.setMonster(slug, monster, quantity, options?)` | `MonsterQuantityResult` |
| `quests.setMonsters(slug, quantities, options?)` | `MonstersUpdateResult` |
| `quests.zones(slug, { zone, subzone, type }, options?)` | `ZoneProgress[]` |

Lo que acepta `update`:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `character_name` | `string` | 200 caracteres como máximo |
| `parallel_quests` | `number` | A partir de 1 |
| `current_step` | `number` | De 1 a `step_count`, `step_count + 1` una vez terminada la misión |
| `show_trades` | `boolean` | Visible en el perfil público |
| `trade_mode` | `0 \| 1` | Automático o experto |
| `trade_offer_threshold`, `trade_want_threshold` | `number \| null` | Modo experto, de 0 a 99 |
| `never_offer_normal`, `never_want_normal` | `boolean` | Monstruos |
| `never_offer_boss`, `never_want_boss` | `boolean` | Jefes |
| `never_offer_arch`, `never_want_arch` | `boolean` | Archimonstruos |
| `type_filters` | `{ "1" \| "2" \| "3": { never_offer, never_want } }` | Los mismos filtros, por tipo |

El lado de intercambio de una misión, `setTrade`, `resetTrade` y `matches`, se describe en [Intercambios](/resources/trading/).
