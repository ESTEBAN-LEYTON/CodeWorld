# Validación con cliente simulado (temporal)

Modo temporal para la validación con usuarios de noviembre de 2026. Los participantes son adultos (docentes y apoderados) que prueban CodeWorld pensando en un niño de 9 a 15 años. Las respuestas son anónimas: no se guardan nombres, correos ni direcciones IP, ni datos de menores.

## Qué hace

| Ruta | Para quién | Qué hace |
| --- | --- | --- |
| `/validacion` | Participante | Consentimiento (mayor de 18 años y acepta) → 3 desafíos reales (nivel 1: «Primeros pasos» y «La primera curva»; nivel 2: el primero) → encuesta de 14 preguntas → código de participante (P-XXXX) |
| `/validacion/resultados` | Autor, con la clave | Métricas de OE1 a OE4, promedios por objetivo, comentarios y descarga en CSV |

Por cada desafío se registran los intentos, los patrones de error, el tiempo hasta la primera ejecución y el tiempo hasta resolverlo. El participante puede saltarse un desafío con «No puedo: pasar». Al final responde si alguien lo ayudó, la escala de 1 a 5 (C1 a C9) y 4 preguntas abiertas (D1 a D4).

## Activarla en Render

1. En Render → codeworld → Environment, agrega `VALIDACION_CLAVE` con una clave larga que solo tú conozcas.
2. Guarda: Render vuelve a desplegar. Sin esa variable, `/api/validacion` responde 404.
3. Abre `https://codeworld-c237.onrender.com` unos minutos antes de cada sesión, porque el plan gratuito se suspende.
4. Comparte `https://codeworld-c237.onrender.com/validacion` con los participantes.
5. Para ver los resultados, abre `/validacion/resultados` e ingresa la clave.

## Quitarla al terminar

1. Descarga el CSV de `/validacion/resultados` y guárdalo con el informe (fuera de git).
2. Borra `VALIDACION_CLAVE` en Render: el endpoint deja de existir.
3. Para quitar el código, revierte el commit «Agregar el modo temporal de validación con cliente simulado» y agrega una migración con `DROP TABLE "validacion_respuesta";`.

## Archivos

- `frontend/src/pantallas/Validacion.tsx` y `ResultadosValidacion.tsx`, y la ruta en `frontend/src/App.tsx`
- `backend/src/servicios/validacionUsuarios.ts`, la opción `claveValidacion` de `crearApp` y la tabla `validacion_respuesta`
- Pruebas: 4 de integración en `backend/src/api.test.ts` y la aceptación `VAL-01` en `e2e/pruebas/validacion.spec.ts`
