---
title: Cuenta
description: Una sola llamada indica a qué cuenta pertenece una clave API. Así saludas a un usuario, validas una clave que te ha dado y obtienes el nombre de usuario que necesitan los endpoints públicos.
sidebar:
  order: 1
---

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.bio);
console.log(me.last_active); // "2026-10-14T09:12:45Z"
```

## Lo que devuelve

El nombre de usuario, la biografía, el avatar y la última actividad de la cuenta. Nada privado: es lo que muestra el perfil público, menos las misiones.

```ts
const me = await metamob.me();

if (me.avatar) {
  console.log(me.avatar.name.fr); // el avatar es un monstruo
  console.log(urls.monsterImage(me.avatar)); // su imagen
}
```

## De una clave a todo lo demás

Una clave no contiene ningún nombre de usuario. `me()` lo da, y con él la parte pública de la cuenta:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // como lo ven los demás
const hidden = (await metamob.quests.list()).filter((quest) => !quest.show_trades);
console.log(`${profile.quests.length} public quests, ${hidden.length} hidden`);
```

Las misiones de la cuenta, incluidas las ocultas, están en [`metamob.quests`](/resources/quests/). El perfil y las misiones públicas de cualquier jugador están en [`metamob.users`](/resources/users/).

## Validar una clave

`me()` es la llamada más ligera que necesita una clave válida, así que es la prueba adecuada cuando un jugador te da la suya.

```ts
async function whose(key: string) {
  try {
    return (await metamob.withKey(key).me()).username;
  } catch (error) {
    if (isMetamobError(error, "UNAUTHORIZED")) return undefined;
    throw error;
  }
}
```

## Referencia

`metamob.me(options?)` se resuelve con un `Account`:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `username` | `string` | El nombre de la cuenta |
| `bio` | `string` | El texto del perfil, vacío cuando no hay ninguno |
| `avatar` | `Avatar \| null` | El monstruo elegido como avatar: `id`, `name`, `image` |
| `last_active` | `string` | Última actividad, como fecha ISO 8601 en UTC: `2026-10-14T09:12:45Z` |

| Error | Cuándo |
| --- | --- |
| `UNAUTHORIZED` | La clave no es válida o ha sido revocada |
| `MISSING_API_KEY` | No se ha dado ninguna clave en ningún sitio |

## Ver también

- [Tu clave API](/start/api-key/)
- [Actuar por otros jugadores](/basics/many-keys/)
- [Tus misiones](/resources/quests/)
- [Otros jugadores](/resources/users/)
