---
title: Cuenta
description: "metamob.me() indica a qué cuenta pertenece una clave API."
sidebar:
  order: 1
---

## Lo que recibes

`metamob.me()` devuelve el nombre de usuario, la biografía, el avatar y la última actividad de la cuenta de la clave. Nada privado: es lo que muestra el perfil público, sin las misiones.

```ts
const me = await metamob.me();

console.log(me.username); // "Ix-xs"
console.log(me.last_active); // "2026-10-14T09:12:45Z"

if (me.avatar) {
  console.log(me.avatar.name.fr); // el avatar es un monstruo
  console.log(urls.monsterImage(me.avatar)); // su imagen
}
```

## De una clave a todo lo demás

Los puntos de acceso públicos piden un nombre de usuario, que da `me()`:

```ts
const { username } = await metamob.me();

const profile = await metamob.users.get(username); // tal como lo ven los demás
console.log(`${profile.quests.length} public quests`);
```

Las misiones de la cuenta, incluidas las ocultas, están en [`metamob.quests`](/resources/quests/). El perfil y las misiones públicas de cualquier jugador están en [`metamob.users`](/resources/users/).

## Validar una clave

`me()` es la llamada más ligera que exige una clave válida: es la prueba adecuada cuando un jugador te da la suya.

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

<!-- exports:start -->
## Referencia

Cada export tiene su página en la [referencia](/reference/):

| Export | Para qué sirve |
| --- | --- |
| [`Account`](/reference/account/) | La cuenta a la que pertenece una clave API. |
| [`Avatar`](/reference/avatar/) | El monstruo que un usuario eligió como avatar. |
| [`UserSummary`](/reference/user-summary/) | Un usuario tal como lo devuelve una búsqueda o una coincidencia de intercambio. |
<!-- exports:end -->
