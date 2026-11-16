# Decisiones del Hito 3 para revisar

Decisiones que tomó Claude el 2026-11-05 mientras no estabas. Cualquiera se puede cambiar: dime el número y la opción que prefieres.

## Lo que requiere tu respuesta primero

| # | Decisión | Elegí | Otras opciones | Si quieres cambiarla |
| --- | --- | --- | --- | --- |
| 1 | POO y robótica, que prometen el OE2 y el alcance | **Sacarlas del alcance** y registrarlo en el informe como cambio controlado. El juego enseña secuencias, ciclos y condiciones. Ya aplicado en `Leyton_E_Formato_de_Proyecto_Final_2026.docx`. | a) Agregar un nivel de POO y bloques de robótica. b) Dejar solo una "noción" de objetos. | Como eres profesor de robótica, puede que te convenga la opción a), pero suma diseño, guías y pruebas con poco plazo. |
| 2 | Hosting | **Un solo Web Service de Render que sirve la API y el frontend, y la base en Neon** (decisión 34). Aún **no está desplegado**, porque requiere cuentas tuyas. | Railway, Fly.io, Netlify, Cloudflare Pages, Supabase. | Solo cambian los pasos de `docs/despliegue.md`; el código no depende del proveedor. |
| 3 | Correo del 2FA | **API HTTP de Brevo**. El plan gratuito de Render bloquea SMTP. | a) Gmail por SMTP: necesita un hosting de pago. b) Resend: necesita dominio propio. c) Dejar el código en los registros del servidor durante la prueba con alumnos. | **Sin confirmar:** que Brevo acepte un remitente verificado sin dominio propio en su plan gratuito. Revísalo al crear la cuenta. |
| 4 | Promesas de la matriz de riesgos que el código no cumple | **Corregir el informe**, no el código: R1 (modo simplificado por FPS, máximo de 50 bloques, carga diferida), R2 (banner de recuperación, log de sesión), R3 (aviso en menos de 24 h ante una brecha) y R6 (reenvío con espera de 60 s, código de respaldo). | Implementarlas. El reenvío del código de R6 es la más útil y barata. | Avísame cuáles quieres implementar. **R6 ya está implementado** (2026-11-13, decisión 29). |

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

## Decisiones del avance del 80% (2026-11-13)

| # | Decisión | Elegí | Otras opciones |
| --- | --- | --- | --- |
| 29 | Tope de intentos del 2FA (R6) | **5 intentos por código, un solo uso y reenvío con espera de 60 s.** Los intentos se cuentan **en memoria** (`backend/src/seguridad/intentos2fa.ts`), porque el código viaja firmado en un JWT sin estado. | Guardarlos en la base de datos: sobrevive a reinicios y sirve con varias instancias, a cambio de una migración. Con una sola instancia en Render no hace falta. |
| 30 | Nuevos desafíos | **6 más, 2 por nivel (12 en total)**, con guías propias y solución de referencia probada. «El caracol» se resuelve con el mismo programa de «El robot decide», para mostrar que una condición generaliza; «Curvas para ambos lados» es el reto final, con una condición dentro de otra. | Más desafíos o un nivel nuevo. |
| 31 | XP de los desafíos anteriores | **Sin cambios**, para no alterar el progreso ya guardado. Los nuevos dan entre 15 y 50 XP. | Rebalancear todo. |
| 32 | Diseño | **Más de juego sin cambiar el flujo:** robot dibujado en vez de una flecha, tablero con muros en relieve, estrella animada, botones con relieve, un color por nivel y una portada con un laberinto de ejemplo. Sin fuentes externas, porque el navegador del alumno no debe contactar a terceros (PA-14). | Una fuente propia descargada en la app, o un rediseño más profundo del panel del tutor. |
| 34 | Forma del despliegue | **Un solo Web Service en Render**, definido en `render.yaml`: Express sirve también el build del frontend. Así la app y la API comparten la dirección, sin CORS ni variables cruzadas, igual que en desarrollo y en las pruebas e2e (`E2E_UN_SERVIDOR=1`). Las migraciones y la carga de desafíos corren en el build, porque el plan gratuito no tiene pre-deploy. | Frontend como Static Site aparte, con `VITE_API_URL` y `CORS_ORIGIN`. |
| 35 | Base de datos | **Neon**, que no vence. | Render PostgreSQL: una cuenta menos, pero la base gratuita vence a los 30 días. |
| 36 | Correo del 2FA en producción | **En los registros de Render por ahora.** Brevo se activa después agregando 2 variables, sin cambiar código. | Configurar Brevo desde el inicio. |
| 37 | Límites en producción | **1000 peticiones y 100 logins por minuto e IP**, porque una sala comparte la IP pública. | Los valores por defecto, 300 y 20, que alcanzan para unos 10 alumnos. |
| 38 | 6 desafíos más (2026-11-16) | **18 en total, 6 por nivel.** Secuencias: «Media vuelta» (parte mirando la pared) y «El rodeo» (parte mirando hacia arriba). Ciclos: «Escalones largos» (un patrón de 5 bloques con «repetir hasta la meta») y «La vuelta completa» (el programa se detiene a mitad de un «repetir»). Condiciones: «El gancho» y «El gran laberinto», que se resuelven con el programa de «Curvas para ambos lados»; el reto final pasa a ser «El gran laberinto». Una prueba temporal confirmó que los programas más simples del nivel no los resuelven. | Otra cantidad, o un nivel nuevo. |

## Lo que no hice

- **Prueba con tus alumnos:** no preparé el protocolo, la pauta ni el consentimiento, porque pediste la parte de código. Es lo siguiente que conviene hacer.

## Lo que está sin resolver

- **Falla intermitente de carga:** en 1 de 3 corridas completas, la sincronización con 100 conexiones dio 5460 errores y no se conoce la causa. Detalle en `docs/pruebas.md`.

## Lo que necesito de ti

1. El formato oficial de biblioteca, y la plantilla de afiche de EXPOTIC si existe.
2. Crear las cuentas de Render, Neon y Brevo, y seguir `docs/despliegue.md`, o decirme si prefieres otra opción.
3. La fecha de la prueba con tus alumnos. Debería ser antes del 15 o 16 de noviembre.
4. Las pruebas manuales PM-01 a PM-07 de `docs/pruebas.md`, en dispositivos reales.
