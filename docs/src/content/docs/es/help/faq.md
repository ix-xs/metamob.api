---
title: Preguntas frecuentes
description: "Respuestas cortas a las preguntas frecuentes."
---

## ¿Es oficial?

No. `@ix-xs/metamob.api` es un proyecto de código abierto independiente, con licencia MIT, sin afiliación con Metamob ni con Ankama. Sigue la [API pública de Metamob](https://www.metamob.fr/help/api), y se actualiza cuando esta cambia.

## ¿Qué es Metamob?

[Metamob](https://www.metamob.fr) es un sitio gratuito donde los jugadores de Dofus siguen los monstruos de las misiones del Dofus Ocre y del Dokille, y se encuentran entre ellos para intercambiarlos. Cubre Dofus (Unity), Dofus Retro y Dofus Touch.

## ¿Cubre toda la API?

Sí, los 40 puntos de acceso. [Todos los métodos](/reference/methods/) los lista, con el método que llama a cada uno.

## ¿Necesito una clave API?

Para cada llamada a la API, sí: consulta [Tu clave API](/start/api-key/). Los [datos del paquete](/basics/embedded-data/) no piden ninguna.

## ¿Es gratuito?

La biblioteca lo es, y la API también. La API acepta 60 solicitudes por minuto por clave, y el cliente se mantiene por debajo: consulta [El límite de solicitudes](/basics/rate-limit/).

## ¿Puedo aumentar el límite de solicitudes?

No, y no intentes eludirlo con varias claves: el límite mantiene el sitio disponible para todo el mundo. Para hacer menos solicitudes, consulta [El límite de solicitudes](/basics/rate-limit/#spending-fewer-requests).

## ¿Funciona con TypeScript? ¿Con JavaScript simple?

Con los dos. Está escrito en TypeScript e incluye sus tipos. En JavaScript, tu editor muestra de todos modos la documentación y completa los nombres de los monstruos.

## ¿Módulos ES o CommonJS?

Los dos: `import { Metamob }` y `const { Metamob } = require(...)`. Consulta [Entornos de ejecución](/reference/runtimes/).

## ¿Puedo usarlo en un navegador?

Sí, con cuidado con la clave: consulta [Entornos de ejecución](/reference/runtimes/#browsers). El objeto `data` solo no tiene riesgo en ningún sitio.

## ¿En qué idioma están los nombres?

En francés, en inglés y en español. Cada monstruo, zona y subzona tiene un `name` con `fr`, `en` y `es`, y los tres se aceptan en cualquier sitio donde se acepta un nombre: consulta [Nombres e identificadores](/basics/names-and-ids/).

## ¿Están al día los datos del paquete?

`data.fetchedAt` da la fecha en la que se leyeron de la API, y cada versión del paquete los actualiza. Un monstruo más reciente que tu versión funciona de todos modos por su nombre en las llamadas: la biblioteca busca entonces el nombre en la API. Consulta [Los datos del paquete](/basics/embedded-data/#when-the-game-changes).

## ¿Puede crear una misión, enviar un mensaje o proponer un intercambio?

Puede enviar un mensaje y proponer un intercambio, una vez que Metamob ha abierto el envío en tu cuenta: consulta [Conversaciones](/resources/conversations/#sending-a-message) y [Propuestas de intercambio](/resources/trade-proposals/#making-a-proposal). También escribe en tus misiones: ajustes, cantidades y ajustes manuales de intercambio. Crear una misión, o confirmar una propuesta, se hace en el sitio.

## ¿Puedo gestionar las misiones de otros jugadores?

Con su propia clave, dada por voluntad propia: consulta [Actuar por otros jugadores](/basics/many-keys/). Sin ella, puedes leer lo que han hecho público.

## ¿Cómo sumo 1 a una cantidad?

Léela, y luego fíjala: `setMonster` fija una cantidad. El fragmento de código está en [Solución de problemas](/help/troubleshooting/#setmonster-did-not-add-one).

## ¿Hace reintentos por sí solo?

Sí: límites de solicitudes, errores del servidor en las lecturas, tiempos agotados y fallos de red, hasta 3 veces con esperas crecientes. Salvo el envío de un mensaje o de una propuesta, que nunca se reintenta. Consulta [Errores](/basics/errors/#what-is-retried).

## Usaba la versión 4. ¿Qué cambia?

La forma de llamar a los métodos, no lo que hacen. [Desde la versión 4](/start/migrating-from-v4/) da el sustituto de cada método.

## ¿Dónde informo de un error o pido algo?

En [GitHub](https://github.com/ix-xs/metamob.api/issues). Para un problema con la propia API o con el sitio, Metamob tiene su propio contacto en [metamob.fr](https://www.metamob.fr).
