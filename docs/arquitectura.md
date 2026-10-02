# Arquitectura

Correspondencia entre el diseño del informe (Capítulo IV) y el código.

## Capa cliente (`frontend/`)

| Diseño | Código |
| --- | --- |
| Motor Blockly, ejecución local | `src/components/BlocklyEditor.tsx`, `src/game/blocks.ts` |
| `BlocklyInterpreter.ejecutar(codigo, laberinto)` | `src/game/interpreter.ts` → `ejecutar()` |
| `ResultadoEjecucion` (trace, estado, mensaje) | `src/game/types.ts` |
| Guías correctivas (OE3) | `src/game/feedback.ts` |
| Desafíos del nivel inicial | `src/game/levels.ts` |

El workspace de Blockly se traduce a una estructura de instrucciones (`Instruccion[]`) que el intérprete
recorre directamente. **No se genera ni se ejecuta JavaScript con `eval`**, lo que elimina el riesgo de
inyección de código y permite cortar ciclos infinitos con `LIMITE_DE_PASOS` (500).

Estados posibles del intérprete: `exito`, `choque`, `incompleto`, `limite_pasos`, `vacio`. Cada estado de
error tiene una guía correctiva, que corresponde a `GUIA_CORRECTIVA.patron_error` en la base de datos.

## Capa backend (`backend/`)

| Diseño | Código |
| --- | --- |
| API Gateway (CORS, rate limiting) | `src/app.ts` |
| `AuthService` | pendiente: `src/services/auth.ts` |
| `ChallengeService` | pendiente: `src/services/challenges.ts` |
| `ProgressService` | pendiente: `src/services/progress.ts` |

## Capa de persistencia

`backend/prisma/schema.prisma` implementa la Figura 4: `Tutor`, `Alumno`, `Consentimiento`, `Nivel`,
`Desafio`, `GuiaCorrectiva`, `Progreso`. `Alumno` solo guarda nombre de usuario, `anon_id` y edad
(Zero-Data, Ley N.° 19.628).
