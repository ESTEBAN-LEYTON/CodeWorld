# Decisiones del Hito 3 para revisar

Decisiones que tomó Claude el 2026-11-05 mientras no estabas. Cualquiera se puede cambiar: dime el número y la opción que prefieres.

## Lo que requiere tu respuesta primero

| # | Decisión | Elegí | Otras opciones | Si quieres cambiarla |
| --- | --- | --- | --- | --- |
| 1 | POO y robótica, que prometen el OE2 y el alcance | **Sacarlas del alcance** y registrarlo en el informe como cambio controlado. El juego enseña secuencias, ciclos y condiciones. Ya aplicado en `Leyton_E_Formato_de_Proyecto_Final_2026.docx`. | a) Agregar un nivel de POO y bloques de robótica. b) Dejar solo una "noción" de objetos. | Como eres profesor de robótica, puede que te convenga la opción a), pero suma diseño, guías y pruebas con poco plazo. |
| 2 | Hosting | **Render (API y frontend) y Neon (base de datos)**: tienen plan gratuito y la guía ya está escrita. Aún **no está desplegado**, porque requiere cuentas tuyas. | Railway, Fly.io, Netlify, Cloudflare Pages, Supabase. | Solo cambian los pasos de `docs/despliegue.md`; el código no depende del proveedor. |
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

## Decisiones del informe

| # | Decisión | Elegí | Otras opciones |
| --- | --- | --- | --- |
| 16 | Formato | **`Pantoja_J_Formato_de_Proyecto_Final_2026.docx`** como base: Arial 12, interlineado 1,5 y máximos por capítulo. **Sin confirmar que sea el formato de biblioteca**: sus metadatos indican otra autora y su índice trae un proyecto judicial. | Si la profesora indica otro, se cambia la plantilla y se vuelve a generar. |
| 17 | Título | **El mismo, en mayúsculas**, porque quizá ya está inscrito. | La plantilla pide el objetivo general sin verbo, por ejemplo: «Plataforma web de programación con bloques visuales y retroalimentación inmediata para jóvenes de 9 a 15 años». |
| 18 | OE1 | **Reemplacé la reducción de 30%**, que no tenía línea base, por «80% llega al primer desafío en 5 minutos o menos». | Medir una línea base real con otra herramienta. |
| 19 | Plazos | **13 de noviembre** para OE2 y OE3, y **15 de noviembre** para OE1 y OE4. | Otra fecha, si la prueba con alumnos se mueve. |
| 20 | Fechas de los sprints | **Las deduje** del calendario y del historial de git: el Sprint 3 termina el 11 de octubre y dura 4 semanas. | Corregirlas si tu registro real dice otra cosa. |
| 21 | Carta Gantt | **La rehíce** con 16 semanas y solo actividades del proyecto. La anterior llegaba a la semana 20. | Volver a la anterior. |
| 22 | Secciones «si aplica» | **Eliminé** «Descripción de la organización» y «Unidad bajo estudio». | Incluirlas si el proyecto se enmarca en tu taller o colegio. |
| 23 | Figuras UML | **Las mantuve** y agregué una tabla que relaciona sus nombres lógicos con los archivos reales. | Redibujarlas con los nombres reales. |

## Decisiones de EXPOTIC

Se regeneran con `npm run expotic`. Quedan en `docs/expotic/`.

| # | Decisión | Elegí | Otras opciones |
| --- | --- | --- | --- |
| 24 | Profesor guía | **Alfonsina del Mar Linarez Castañeda**, como en la portada del informe. El ejemplo del cartel muestra a Jenny Pantoja Blyde, que recibe los archivos. | Cambiarlo si EXPOTIC pide otro nombre. |
| 25 | Resumen sin citas | **Sin citas ni referencias**: con Arial 12 e interlineado sencillo, los dos idiomas y las referencias no caben en 1 página, y un resumen normalmente no cita. | Agregar «Wing (2006)» y su referencia, acortando el texto. |
| 26 | Título del resumen en 13 pt | **13 pt en negrita**; el resto, Arial 12 como pide la plantilla. | Todo en 12 pt. |
| 27 | Cartel | **HTML convertido a PDF de 90 x 120 cm** con Playwright, con los colores de la UNAB y un diagrama de contexto simple, no los diagramas técnicos del informe. | Hacerlo en Canva o PowerPoint a partir de este. |
| 28 | QR del cartel | **Recuadro por completar**: aún no hay una URL desplegada. | Un QR al repositorio de GitHub, si es público. |

## Decisiones del avance del 80% (2026-11-13)

| # | Decisión | Elegí | Otras opciones |
| --- | --- | --- | --- |
| 29 | Tope de intentos del 2FA (R6) | **5 intentos por código, un solo uso y reenvío con espera de 60 s.** Los intentos se cuentan **en memoria** (`backend/src/seguridad/intentos2fa.ts`), porque el código viaja firmado en un JWT sin estado. | Guardarlos en la base de datos: sobrevive a reinicios y sirve con varias instancias, a cambio de una migración. Con una sola instancia en Render no hace falta. |
| 30 | Nuevos desafíos | **6 más, 2 por nivel (12 en total)**, con guías propias y solución de referencia probada. «El caracol» se resuelve con el mismo programa de «El robot decide», para mostrar que una condición generaliza; «Curvas para ambos lados» es el reto final, con una condición dentro de otra. | Más desafíos o un nivel nuevo. |
| 31 | XP de los desafíos anteriores | **Sin cambios**, para no alterar el progreso ya guardado. Los nuevos dan entre 15 y 50 XP. | Rebalancear todo. |
| 32 | Diseño | **Más de juego sin cambiar el flujo:** robot dibujado en vez de una flecha, tablero con muros en relieve, estrella animada, botones con relieve, un color por nivel y una portada con un laberinto de ejemplo. Sin fuentes externas, porque el navegador del alumno no debe contactar a terceros (PA-14). | Una fuente propia descargada en la app, o un rediseño más profundo del panel del tutor. |
| 33 | Informe | **Actualizado con 12 desafíos, 89 pruebas y el R6 implementado.** Los objetivos OE2 y OE3 siguen diciendo 6 desafíos, porque son el compromiso original; los resultados y las conclusiones dicen que se entregó el doble. La fila del Sprint 3 también conserva los 6 desafíos que entregó ese sprint. | Cambiar los objetivos a 12 desafíos, aunque así se reescribe el compromiso después de cumplirlo. |

## Lo que no hice

- **Informe:** versión nueva generada el 2026-11-06 con `python3 docs/informe/generar_informe.py`. Sus pendientes están en amarillo y sus decisiones, en la sección «Decisiones del informe».
- **EXPOTIC:** primera versión del afiche y del resumen hecha el 2026-11-13 (ver «Decisiones de EXPOTIC»). Les falta el resultado de la prueba con alumnos.
- **Prueba con tus alumnos:** no preparé el protocolo, la pauta ni el consentimiento, porque pediste la parte de código. Es lo siguiente que conviene hacer.

## Lo que está sin resolver

- **Falla intermitente de carga:** en 1 de 3 corridas completas, la sincronización con 100 conexiones dio 5460 errores y no se conoce la causa. Detalle en `docs/pruebas.md`.

## Lo que necesito de ti

1. El formato oficial de biblioteca, y la plantilla de afiche de EXPOTIC si existe.
2. Crear las cuentas de Render, Neon y Brevo, y seguir `docs/despliegue.md`, o decirme si prefieres otra opción.
3. La fecha de la prueba con tus alumnos. Debería ser antes del 15 o 16 de noviembre.
4. Las pruebas manuales PM-01 a PM-07 de `docs/pruebas.md`, en dispositivos reales.
