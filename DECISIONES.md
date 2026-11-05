# Decisiones del Hito 3 para revisar

Decisiones que tomó Claude el 2026-11-05 mientras no estabas. Cualquiera se puede cambiar: dime el número y la opción que prefieres.

## Lo que requiere tu respuesta primero

| # | Decisión | Elegí | Otras opciones | Si quieres cambiarla |
| --- | --- | --- | --- | --- |
| 1 | POO y robótica, que prometen el OE2 y el alcance | **Sacarlas del alcance** y registrarlo en el informe como cambio controlado. El juego enseña secuencias, ciclos y condiciones. El informe todavía no se modifica. | a) Agregar un nivel de POO y bloques de robótica. b) Dejar solo una "noción" de objetos. | Como eres profesor de robótica, puede que te convenga la opción a), pero suma diseño, guías y pruebas con poco plazo. |
| 2 | Hosting | **Render (API y frontend) y Neon (base de datos)**: tienen plan gratuito y la guía ya está escrita. Aún **no está desplegado**, porque requiere cuentas tuyas. | Railway, Fly.io, Netlify, Cloudflare Pages, Supabase. | Solo cambian los pasos de `docs/despliegue.md`; el código no depende del proveedor. |
| 3 | Correo del 2FA | **API HTTP de Brevo**. El plan gratuito de Render bloquea SMTP. | a) Gmail por SMTP: necesita un hosting de pago. b) Resend: necesita dominio propio. c) Dejar el código en los registros del servidor durante la prueba con alumnos. | **Sin confirmar:** que Brevo acepte un remitente verificado sin dominio propio en su plan gratuito. Revísalo al crear la cuenta. |
| 4 | Promesas de la matriz de riesgos que el código no cumple | **Corregir el informe**, no el código: R1 (modo simplificado por FPS, máximo de 50 bloques, carga diferida), R2 (banner de recuperación, log de sesión), R3 (aviso en menos de 24 h ante una brecha) y R6 (reenvío con espera de 60 s, código de respaldo). | Implementarlas. El reenvío del código de R6 es la más útil y barata. | Avísame cuáles quieres implementar. |

## Decisiones de código

| # | Decisión | Elegí | Otras opciones |
| --- | --- | --- | --- |
| 5 | Git | Rama **`hito-3`**, sin subir a GitHub y sin tocar `main`. | Trabajar sobre `main` o subir la rama. |
| 6 | Autoguardado | En **cada cambio** del programa, por alumno y desafío. Es más estricto que los 30 s que dice el R2. | Cada 30 s, como dice el informe. |
| 7 | Apertura sin conexión | **Service worker propio**, de unas 70 líneas y sin dependencias. | `vite-plugin-pwa`, que además permitiría instalar la app, a cambio de una dependencia más. |
| 8 | Recursos de Blockly | **Servidos desde la app**, en `frontend/public/blockly-media`. Antes se descargaban de `static.blockly.com`, lo que rompía el modo sin conexión y contactaba a un tercero desde el navegador de menores. Si actualizas Blockly, hay que volver a copiarlos. | Copiarlos automáticamente en cada build. Desactivar sonidos e íconos. |
| 9 | Contacto del tutor | **Solo correo**; ya no se acepta teléfono, porque no hay envío por SMS. | Agregar SMS, que suele ser de pago. |
| 10 | Consentimiento | **Trigger en la base de datos** que impide modificarlo o borrarlo, como exige el RF03. Hoy tampoco se puede borrar un alumno, ni existe esa función. | Dejarlo solo en la lógica de la app. Revisar qué hacer si un tutor pide eliminar los datos de su hijo: conviene comentarlo con la profesora por la Ley 19.628. |
| 11 | Pruebas de aceptación | **Playwright** con Chromium en 3 perfiles de dispositivo. | Agregar WebKit y Firefox. No reemplazan a un iPhone real. |
| 12 | Pruebas de carga | **Autocannon** contra el build de producción. El umbral es mío, porque el informe no fija uno: p97,5 de 1000 ms o menos y 0 errores. | k6. Otro umbral: dime cuál si la profesora o el syllabus piden uno. |
| 13 | Rate limiting | **Sin cambios por defecto** (300 por minuto en la API y 20 en login), ahora configurable. Alcanza para 10 alumnos con la misma IP. | Subirlos para salas de 30 o más; `docs/despliegue.md` explica cómo. |
| 14 | `Pendientes.txt` | **Fuera de git**, porque tiene correos de la profesora. | Incluirlo en el repositorio. |
| 15 | `docs/arquitectura.md` | **No lo restauré**: estaba desactualizado y lo habías borrado. Sigue en el historial de git. Quité el enlace del README. | Restaurarlo y actualizarlo. |

## Lo que no hice

- **Informe:** no lo modifiqué. Espera el formato oficial de biblioteca. Las correcciones de la profesora, las conclusiones y las páginas preliminares siguen pendientes.
- **EXPOTIC:** el afiche y el resumen, que se entregan el **15 de noviembre**, no están hechos.
- **Prueba con tus alumnos:** no preparé el protocolo, la pauta ni el consentimiento, porque pediste la parte de código. Es lo siguiente que conviene hacer.

## Lo que está sin resolver

- **Falla intermitente de carga:** en 1 de 3 corridas completas, la sincronización con 100 conexiones dio 5460 errores y no se conoce la causa. Detalle en `docs/pruebas.md`.
- **Código 2FA:** se puede reintentar hasta que venza a los 10 minutos, limitado solo por el rate limiting (20 intentos por minuto e IP). No hay tope de intentos por código. El riesgo es bajo, pero es una mejora pendiente.

## Lo que necesito de ti

1. El formato oficial de biblioteca, y la plantilla de afiche de EXPOTIC si existe.
2. Crear las cuentas de Render, Neon y Brevo, y seguir `docs/despliegue.md`, o decirme si prefieres otra opción.
3. La fecha de la prueba con tus alumnos. Debería ser antes del 15 o 16 de noviembre.
4. Las pruebas manuales PM-01 a PM-07 de `docs/pruebas.md`, en dispositivos reales.
