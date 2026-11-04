---
title: Un informe de progreso
description: "Un script que muestra en qué punto está una misión y en qué zonas cazar a continuación, en tres solicitudes."
sidebar:
  order: 2
---

## Lo que obtienes

Un script que muestra el avance de una misión y las zonas donde faltan más monstruos:

```text
Ix on Tylezia, step 12 of 18
214 of 337 monsters, 64 %

Hunt next:
  Amakna            9 missing   Bouflet le Puéril, Tofuldebeu l'Explosif, ...
  Île d'Otomaï      7 missing   ...
  Plaines de Cania  4 missing   ...
```

## El script

```ts title="progress.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // lee METAMOB_API_KEY

const slug = process.argv[2] ?? (await metamob.quests.list())[0]?.slug;
if (!slug) throw new Error("This account has no quest.");

// 1 solicitud: la propia misión.
const quest = await metamob.quests.get(slug);
const steps = quest.quest_template.step_count;
console.log(`${quest.character_name} on ${quest.server?.name}, step ${quest.current_step} of ${steps}`);

// 1 solicitud: cuántos monstruos faltan todavía.
const total = quest.quest_template.monster_count;
const needed = metamob.quests.monsters(slug, { status: "needed" });
const missing = (await needed.count()) ?? 0;
const done = total - missing;
console.log(`${done} of ${total} monsters, ${Math.round((done / total) * 100)} %\n`);

// 1 solicitud: todo, por zona.
const zones = await metamob.quests.zones(slug);

const report = zones
  .map((zone) => {
    // Un monstruo está en cada subzona donde vive: un Set lo cuenta una vez.
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
  const count = String(names.length).padStart(3);
  console.log(`  ${zone.padEnd(24)} ${count} missing   ${shown}`);
}
```

Lánzalo con el slug de una misión, o sin argumento para la primera misión de la cuenta:

```bash
node --env-file=.env progress.js 21b0a742
```

## Por qué tres solicitudes

- `count()` solo pide el total, no la lista de los monstruos.
- `quests.zones()` devuelve toda la misión en una respuesta, ya ordenada por zona.
- Los nombres de las zonas y de los monstruos están en las respuestas.

Listar todos los monstruos y ordenarlos tú mismo también funcionaría, con más solicitudes: 600 monstruos son tres páginas de 200.

## Solo los archimonstruos, solo una zona

`quests.zones()` acepta filtros, que reducen la respuesta:

```ts
const archmonsters = await metamob.quests.zones(slug, { type: "archimonstre" });
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

## Lo que puedes intercambiar

La misma misión, del lado del intercambio: lo que tienes de sobra, y lo que la misión ofrece de ello una vez aplicados tus ajustes:

```ts
const quest = await metamob.quests.get(slug);
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();

for (const monster of spares) {
  const kept = monster.quantity - quest.parallel_quests - monster.offer;
  console.log(monster.name.fr, `offers ${monster.offer}, keeps ${kept}`);
}
```

## Para otra persona

Con la clave que un jugador te ha confiado, el mismo script se ejecuta en su nombre:

```ts
const theirs = metamob.withKey(theirKey);
const quests = await theirs.quests.list();
```

Sin su clave, [`users.quest()`](/resources/users/#the-monsters-of-a-public-quest) muestra de todos modos lo que busca una misión pública.
