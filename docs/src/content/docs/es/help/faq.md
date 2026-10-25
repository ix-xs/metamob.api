---
title: Preguntas frecuentes
description: "Respuestas cortas a las preguntas que surgen antes y después de instalar la biblioteca, cada una con un enlace a la página que trata el tema."
---

## ¿Es oficial?

No. `@ix-xs/metamob.api` es un proyecto independiente de código abierto, bajo licencia MIT. No está afiliado a Metamob ni a Ankama. Sigue la [API pública de Metamob](https://www.metamob.fr/help/api) y se actualiza cuando la API cambia.

## ¿Qué es Metamob?

[Metamob](https://www.metamob.fr) es un sitio gratuito donde los jugadores de Dofus siguen los monstruos de las misiones del Dofus Ocre y del Dokille, y se encuentran entre sí para intercambiarlos. Cubre Dofus (Unity), Dofus Retro y Dofus Touch.

## ¿Cubre toda la API?

Sí, los 38 endpoints. [Todos los métodos](/reference/methods/) los enumera junto al método que llama a cada uno.

## ¿Necesito una clave API?

Para cada llamada a la API, sí: ver [Tu clave API](/start/api-key/). Los [datos del paquete](/basics/embedded-data/) no necesitan ninguna.

## ¿Es gratis?

La biblioteca lo es, y la API también. La API está limitada a 60 solicitudes por minuto por clave, algo que el cliente respeta por ti: ver [El límite de solicitudes](/basics/rate-limit/).

## ¿Puedo aumentar el límite de solicitudes?

No, y por favor no intentes esquivarlo con varias claves. Metamob lo mantiene una sola persona, y el límite hace que siga disponible para todos. La biblioteca te ayuda más bien a necesitar menos solicitudes: páginas más grandes, una caché, lotes y datos de referencia leídos del paquete.

## ¿Funciona con TypeScript? ¿Con JavaScript sin más?

Con los dos. Está escrita en TypeScript e incluye sus tipos. En JavaScript, tu editor muestra igualmente la documentación y completa los nombres de los monstruos.

## ¿Módulos ES o CommonJS?

Los dos: `import { Metamob }` y `const { Metamob } = require(...)`. Ver [Entornos de ejecución](/reference/runtimes/).

## ¿Puedo usarla en un navegador?

Sí, con cuidado con la clave: ver [Entornos de ejecución](/reference/runtimes/#browsers). El objeto `data`, por sí solo, es seguro en cualquier parte.

## ¿En qué idioma están los nombres?

En francés, inglés y español. Cada monstruo, zona y subzona tiene un `name` con `fr`, `en` y `es`, y los tres se aceptan allí donde escribas un nombre: ver [Nombres e identificadores](/basics/names-and-ids/).

## ¿Están al día los datos del paquete?

`data.fetchedAt` dice cuándo se leyeron de la API. Cada versión del paquete los actualiza. Un monstruo más reciente que tu versión funciona igualmente por su nombre en las llamadas, porque la biblioteca pregunta a la API cuando un nombre es desconocido: ver [Los datos del paquete](/basics/embedded-data/#when-the-game-changes).

## ¿Puede crear una misión, enviar un mensaje o proponer un intercambio?

No: la API no lo ofrece. A través de la API lees casi todo, y escribes en tus propias misiones: ajustes, cantidades y ajustes manuales de intercambio. El resto se hace en el sitio.

## ¿Puedo gestionar las misiones de otros jugadores?

Con su propia clave, dada voluntariamente: ver [Actuar por otros jugadores](/basics/many-keys/). Sin ella puedes leer lo que hicieron público.

## ¿Cómo sumo uno a una cantidad?

Léela y luego fíjala: `setMonster` fija una cantidad. El fragmento de código está en [Solución de problemas](/help/troubleshooting/#setmonster-did-not-add-one).

## ¿Reintenta por sí sola?

Sí: límites de solicitudes, errores del servidor en las lecturas, tiempos de espera agotados y fallos de red, hasta 3 veces con esperas crecientes. Ver [Errores](/basics/errors/#what-is-retried).

## Usaba la versión 4. ¿Qué cambia?

La forma de llamar a las cosas, no lo que hacen. [Desde la versión 4](/start/migrating-from-v4/) da la correspondencia de cada método.

## ¿Dónde informo de un error o pido algo?

En [GitHub](https://github.com/ix-xs/metamob.api/issues). Para un problema con la propia API o con el sitio, Metamob tiene su propio contacto en [metamob.fr](https://www.metamob.fr).

## Ver también

- [Inicio rápido](/start/quick-start/)
- [Solución de problemas](/help/troubleshooting/)
- [Todos los métodos](/reference/methods/)
- [El registro de cambios](https://github.com/ix-xs/metamob.api/blob/main/CHANGELOG.md)
