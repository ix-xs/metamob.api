---
title: Inicio rápido
description: "Instala el paquete, consigue tu clave API y luego lee tus misiones, averigua lo que aún le falta a una de ellas y registra un monstruo que acabas de capturar."
---

```ts
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob({ apiKey: process.env.METAMOB_API_KEY });

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

## Instalar

```bash
npm install @ix-xs/metamob.api
```

Necesita Node.js 20 o posterior y no tiene dependencias. Para Bun, Deno, los navegadores y los entornos edge, consulta [Entornos de ejecución](/reference/runtimes/).

Los dos sistemas de módulos funcionan:

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Consigue tu clave API

Cada llamada necesita una clave. Crea la tuya en [metamob.fr](https://www.metamob.fr), en **Configuración > Clave API**.

No dejes la clave en tu código. Ponla en una variable de entorno llamada `METAMOB_API_KEY`: el cliente la lee cuando no pasas `apiKey`.

```ts
const metamob = new Metamob(); // usa process.env.METAMOB_API_KEY
```

[Tu clave API](/start/api-key/) explica a qué da acceso una clave y cómo guardarla.

## Lee tus misiones

Una misión se conoce por su slug, el identificador corto que aparece en la dirección de su página. `quests.list()` da los slugs de la cuenta.

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Averigua lo que aún le falta a una misión

Una lista se puede esperar para obtener una página, o recorrer hasta el final con `for await`. Las páginas se piden a medida que avanzas.

```ts
for await (const monster of metamob.quests.monsters(slug, { status: "needed" })) {
  console.log(`step ${monster.step}: ${monster.name.fr} (${monster.quantity} owned)`);
}

// Solo el número, en una única solicitud pequeña.
const left = await metamob.quests.monsters(slug, { status: "needed" }).count();
```

[Listas](/basics/lists/) trata las páginas, los límites y el recuento.

## Registra un monstruo

Un monstruo se designa por su nombre en francés, inglés o español, por su identificador o por un objeto que tenga su identificador. Los acentos y las mayúsculas no importan.

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
console.log(result.status); // lo que posees menos las misiones en paralelo: 0 significa «suficiente»
```

Un nombre con una errata no se envía a tu misión. La llamada lanza un error, y el error indica los nombres más parecidos:

```ts
try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Nombres e identificadores](/basics/names-and-ids/) explica lo que se acepta, y [Errores](/basics/errors/) lo que se puede lanzar.

## Consulta algo sin enviar una solicitud

Los monstruos, las zonas y los servidores vienen con el paquete. `data` responde desde la memoria, que es lo que necesita un autocompletado.

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## Ten en cuenta el límite de solicitudes

Metamob permite 60 solicitudes por minuto por clave. El cliente las cuenta y hace esperar a la siguiente llamada en lugar de fallar, así que no tienes que hacer nada. [El límite de solicitudes](/basics/rate-limit/) muestra cómo vigilarlo.

## Ver también

- [Tus misiones](/resources/quests/)
- [Intercambios](/resources/trading/)
- [Los datos del paquete](/basics/embedded-data/)
- [Desde la versión 4](/start/migrating-from-v4/)
