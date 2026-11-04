---
title: Inicio rápido
description: "Instalar el paquete, crear un cliente y hacer las primeras llamadas: leer tus misiones, ver lo que les falta y registrar un monstruo."
---

## Instalar

```bash
npm install @ix-xs/metamob.api
```

Necesita Node.js 20 o posterior. El paquete no tiene dependencias, y se importa con los dos sistemas de módulos:

```ts
import { Metamob } from "@ix-xs/metamob.api";
```

```js
const { Metamob } = require("@ix-xs/metamob.api");
```

## Crear el cliente

Cada llamada a la API necesita una clave. Crea la tuya en [metamob.fr](https://www.metamob.fr), en **Configuración > Clave API**, y ponla en la variable de entorno `METAMOB_API_KEY`:

```bash title=".env"
METAMOB_API_KEY=your-key
```

El cliente lee esta variable cuando no le pasas ninguna clave:

```ts title="index.ts"
import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
```

:::note
Node.js no lee los archivos `.env` por sí solo: lanza el script con `node --env-file=.env index.js`, o pasa la clave con `new Metamob({ apiKey })`. [Tu clave API](/start/api-key/) da los detalles.
:::

## Leer tus misiones

Una misión se designa por su slug, el identificador corto al final de la dirección de su página. `quests.list()` devuelve las misiones de la cuenta, con su slug:

```ts
const quests = await metamob.quests.list();

for (const quest of quests) {
  console.log(quest.slug, quest.character_name, quest.server?.name);
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
}
```

## Ver lo que le falta a una misión

`quests.monsters()` lista los monstruos de una misión. Con `status: "needed"`, solo conserva los que aún faltan:

```ts
const needed = metamob.quests.monsters(slug, { status: "needed" });

for await (const monster of needed) {
  console.log(`step ${monster.step}: ${monster.name.fr}`);
}

const left = await needed.count();
```

`for await` recorre todas las páginas de la lista, una solicitud por página. `count()` solo pide el total. [Listas](/basics/lists/) explica las otras formas de leer una lista.

## Registrar un monstruo

`quests.setMonster()` fija el número de ejemplares que posees. El monstruo se puede dar por su identificador o por su nombre, en francés, en inglés o en español:

```ts
const result = await metamob.quests.setMonster(slug, "Bouflet le Puéril", 1);

console.log(result.owned); // 1
```

Si el nombre no corresponde a ningún monstruo, la llamada lanza un error `UNKNOWN_NAME` que propone los nombres más parecidos, y no se envía nada:

```ts
import { isMetamobError } from "@ix-xs/metamob.api";

try {
  await metamob.quests.setMonster(slug, "Bouflet le Pueril!", 1);
} catch (error) {
  if (isMetamobError(error, "UNKNOWN_NAME")) console.log(error.message);
}
```

[Nombres e identificadores](/basics/names-and-ids/) detalla lo que se acepta, y [Errores](/basics/errors/) lo que se puede lanzar.

## Buscar sin solicitud

Los monstruos, las zonas y los servidores vienen incluidos en el paquete. `data` busca directamente en ellos, sin llamar a la API:

```ts
import { data } from "@ix-xs/metamob.api";

data.monster("tofu malefique")?.name.fr; // "Tofu Maléfique"
data.searchMonsters("bouf", { limit: 5 }).map((monster) => monster.name.fr);
data.zonesOf("Tofu Maléfique").map((zone) => zone.name.fr); // ["Amakna"]
```

## El límite de solicitudes

Metamob acepta 60 solicitudes por minuto por clave. El cliente las cuenta: por encima de ese número, hace esperar a las llamadas siguientes en lugar de enviarlas. [El límite de solicitudes](/basics/rate-limit/) muestra cómo seguir en qué punto estás.
