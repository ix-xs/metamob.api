---
title: Tus misiones
description: Lee las misiones de la cuenta, cambia sus ajustes, registra los monstruos que posees uno a uno o por lotes, y sigue el progreso zona por zona. Todo lo de esta página funciona solo con tus propias misiones.
sidebar:
  order: 2
---

```ts
const [quest] = await metamob.quests.list();

if (quest) {
  const missing = await metamob.quests.monsters(quest.slug, { status: "needed" }).count();
  console.log(`${quest.character_name}: ${missing} monsters to go`);
}
```

## Listar tus misiones

`quests.list()` devuelve todas las misiones de la cuenta, las favoritas primero, incluidas las que están ocultas en el perfil público. De aquí salen los slugs: todos los demás métodos reciben uno.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // misiones en paralelo: cuántos ejemplares de cada monstruo hacen falta
}
```

Un slug es también la última parte de la dirección de una misión en metamob.fr.

## Leer los ajustes de una misión

`quests.get()` añade lo que solo ve el propietario: el modo de intercambio, sus umbrales y los filtros por tipo de monstruo.

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // visible en el perfil público
quest.trade_mode; // 0 automático, 1 experto
quest.trade_offer_threshold; // modo experto: ofrecer a partir de esta cantidad
quest.type_filters["3"]?.never_want; // no buscar nunca archimonstruos
```

`type_filters` está indexado por el identificador del tipo de monstruo: `"1"` monstruos, `"2"` jefes, `"3"` archimonstruos.

## Cambiar los ajustes

Envía solo lo que cambia. La respuesta contiene el slug y los campos que has cambiado, nada más.

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Modo de intercambio experto, con sus umbrales.
await metamob.quests.update(slug, { trade_mode: 1, trade_offer_threshold: 3, trade_want_threshold: 1 });

// No ofrecer nunca archimonstruos. Dos formas de decirlo.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## Los monstruos de una misión

`quests.monsters()` lista lo que pide la misión, junto con lo que posees. Es una [lista](/basics/lists/): espérala para obtener una página, recórrela para obtenerlo todo.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` hace dos preguntas distintas:

| `status` | Pregunta | Significado |
| --- | --- | --- |
| `needed` | Progreso | Posees menos ejemplares de los que necesita la misión |
| `ok` | Progreso | Posees exactamente los necesarios |
| `excess` | Progreso | Tienes ejemplares de sobra |
| `wanted` | Intercambio | La misión lo busca, una vez aplicados tus ajustes de intercambio |
| `offered` | Intercambio | La misión lo ofrece, una vez aplicados tus ajustes de intercambio |

Un monstruo en `excess` no siempre está `offered`: un filtro o un umbral puede retenerlo.

Este `status` es un filtro. Dos respuestas, más abajo, tienen su propio `status`: un número tras una escritura, y una de tres palabras en el progreso por zonas.

```ts
const toCatch = await metamob.quests.monsters(slug, { type: "archimonstre", status: "needed" }).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const overridden = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Registrar un monstruo

`setMonster` fija cuántos ejemplares de un monstruo posees. No es un incremento: lee primero el valor si quieres sumar uno.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // lo que posees menos las misiones en paralelo: negativo significa que faltan
result.effective_offer; // lo que la misión ofrece ahora
result.effective_want; // lo que la misión busca ahora
```

El monstruo es un nombre, un identificador o un objeto, ver [Nombres e identificadores](/basics/names-and-ids/). Un nombre que no coincide con nada lanza `UNKNOWN_NAME` y no se escribe nada.

## Registrar muchos monstruos

`setMonsters` acepta un lote entero, en la forma que tengas a mano.

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

La API acepta 200 monstruos por solicitud. Un lote más largo se divide, las partes se envían una tras otra y las respuestas se fusionan. Todos los nombres se comprueban antes de la primera solicitud: una sola errata y no se escribe nada.

Cuando el mismo monstruo aparece dos veces, gana la última cantidad.

## Progreso por zonas

`quests.zones()` organiza una misión según dónde viven los monstruos, con las subzonas menos avanzadas primero. Un monstruo aparece en cada subzona en la que vive.

```ts
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);

  for (const subzone of zone.subzones) {
    const missing = subzone.monsters.filter((monster) => monster.status === "incomplete");
    if (missing.length) console.log(`  ${subzone.name.fr}: ${missing.map((monster) => monster.name.fr).join(", ")}`);
  }
}
```

La respuesta no está paginada y puede ser grande. Redúcela con `zone`, `subzone` y `type`:

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

Un monstruo está `validated` cuando su etapa ya se ha superado, `completed` cuando posees suficientes ejemplares, e `incomplete` en los demás casos.

## Límites y errores

- Todos los métodos responden `NOT_FOUND` para una misión que no es tuya, exista o no.
- Las cantidades van de 0 a 99. Fuera de ese rango, la API responde `BAD_REQUEST`.
- Un `current_step` más allá de la última etapa de la misión vuelve como `SERVER_ERROR`, no como `BAD_REQUEST`: el número de etapas es `quest_template.step_count`.
- Una escritura borra lo que el cliente tenía en caché para tu clave, así que la siguiente lectura es fresca.
- Crear y eliminar una misión no forma parte de la API: hazlo en el sitio.

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
| `current_step` | `number` | De 1 a la última etapa de la misión |
| `show_trades` | `boolean` | Visible en el perfil público |
| `trade_mode` | `0 \| 1` | Automático o experto |
| `trade_offer_threshold`, `trade_want_threshold` | `number \| null` | Modo experto, de 0 a 30 |
| `never_offer_normal`, `never_want_normal` | `boolean` | Monstruos |
| `never_offer_boss`, `never_want_boss` | `boolean` | Jefes |
| `never_offer_arch`, `never_want_arch` | `boolean` | Archimonstruos |
| `type_filters` | `{ "1" \| "2" \| "3": { never_offer, never_want } }` | Los mismos filtros, por tipo |

La parte de intercambio de una misión, `setTrade`, `resetTrade` y `matches`, está en [Intercambios](/resources/trading/).

## Ver también

- [Intercambios](/resources/trading/)
- [Listas](/basics/lists/)
- [Nombres e identificadores](/basics/names-and-ids/)
- [Un informe de progreso](/recipes/quest-progress/)
