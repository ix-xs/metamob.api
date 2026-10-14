---
title: Un informe de progreso
description: "Un script que muestra en qué punto está una de tus misiones, lo que queda por encontrar en cada zona y en qué zona cazar a continuación. Tres solicitudes, sea cual sea el tamaño de la misión."
sidebar:
  order: 2
---

## Lo que obtienes

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 64 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## El script

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lee METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 solicitud: la misión en sí.
const quest = await metamob.quests.get(slug);
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${quest.quest_template.step_count}`);

// 1 solicitud: cuántos monstruos faltan todavía.
const total = quest.quest_template.monster_count;
const missing = (await metamob.quests.monsters(slug, { status: "needed" }).count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 solicitud: todo, por zona.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // Un monstruo aparece en cada subzona donde vive: se cuenta una vez por zona.
    const names = new Set();
    for (const subzone of zone.subzones) {
      for (const monster of subzone.monsters) {
        if (monster.status === "incomplete") names.add(monster.name.fr);
      }
    }
    return { zone: zone.name.fr, names: [...names] };
  })
  .filter((entry) => entry.names.length > 0)
  .sort((a, b) => b.names.length - a.names.length);

console.log("Hunt next:");
for (const { zone, names } of report.slice(0, 5)) {
  const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
  console.log(`  ${zone.padEnd(24)} ${String(names.length).padStart(3)} missing   ${shown}`);
}
```

Ejecútalo con el slug de una misión, o sin nada para tomar la primera misión de la cuenta:

```bash
METAMOB_API_KEY=your-key node progress.mjs 21b0a742
```

## Por qué tres solicitudes

- `count()` pide un solo elemento y lee el total, en lugar de recorrer cientos de monstruos página a página para contarlos.
- `quests.zones()` responde por toda la misión de una vez, ya agrupada.
- Los nombres de las zonas y de los monstruos vienen en las respuestas. No hay nada que buscar aparte.

Listar todos los monstruos y agruparlos tú mismo también funcionaría, con más solicitudes: una misión de 600 monstruos son tres páginas de 200.

## Solo los archimonstruos, solo una zona

`quests.zones()` filtra en el servidor, lo que reduce la respuesta.

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## Lo que puedes intercambiar

La misma misión, vista desde el otro lado: los ejemplares que tienes de sobra, y lo que la misión ofrece realmente una vez aplicados tus ajustes de intercambio.

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}`, kept > 0 ? `(keeps ${kept} back)` : "");
}
```

## Para otra persona

Con la clave de un jugador que te la dio, el mismo script se ejecuta en su nombre:

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Sin su clave, una misión pública muestra igualmente lo que busca su propietario, mediante [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest).

## Ver también

- [Tus misiones](/resources/quests/)
- [Listas](/basics/lists/)
- [Intercambios](/resources/trading/)
- [El límite de solicitudes](/basics/rate-limit/)
