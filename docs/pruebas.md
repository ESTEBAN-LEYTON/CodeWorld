# Pruebas de CodeWorld

Evidencia de la Iteración 3 (pruebas funcionales, de integración y de cargabilidad) y de las pruebas de aceptación del cliente. Resultados obtenidos el 2026-11-05 en un computador local; las unitarias, de integración y de aceptación se repitieron el 2026-11-13 tras agregar 6 desafíos y reforzar el 2FA. La prueba de carga no se repitió.

## Cómo ejecutarlas

Se necesita PostgreSQL encendido (`podman start codeworld-db`, o `docker compose up -d` la primera vez). Las pruebas de integración, e2e y de carga **vacían la base `codeworld_test`**, nunca la de desarrollo, y no deben correr al mismo tiempo porque la comparten.

```bash
npm test             # unitarias e integración
npm run test:e2e     # aceptación en navegador real (primera vez: npx --prefix e2e playwright install chromium)
npm run test:carga   # cargabilidad; reescribe docs/pruebas/resultados-carga.md
```

## Resumen

| Tipo | Herramienta | Alcance | Resultado |
| --- | --- | --- | --- |
| Unitarias | Vitest | Interpretador, MotorGuias, GestorProgreso, ayuda de bloques, contraseñas, tokens, intentos 2FA y mensajería | Pasan |
| Integración | Vitest, Supertest y PostgreSQL | API completa contra una base real | Pasan |
| Total unitarias e integración | | Frontend 53; backend 36 | **89 de 89** |
| Funcionales y de aceptación | Playwright (Chromium) | 15 casos en computador, tableta y celular | **43 pasan, 2 omitidas, 0 fallan** |
| Cargabilidad | Autocannon | 4 endpoints con 10, 50 y 100 conexiones | Ver abajo; **1 falla intermitente sin explicar** |
| Aceptación con usuarios (OE4) | Grupo de control | Al menos 10 jóvenes | **Pendiente** |
| Compatibilidad en equipos reales (OE2) | Manual | Safari en iOS, Android, equipo de gama baja | **Pendiente** |

Las 2 omitidas son PA-05 y PA-09 en celular, porque requieren arrastrar bloques con el dedo. Se cubren en la prueba manual PM-01.

## Pruebas de aceptación automatizadas

Código en `e2e/pruebas/aceptacion.spec.ts`. El resultado es el de los tres perfiles de dispositivo.

| ID | Requerimiento | Criterio de aceptación | Resultado |
| --- | --- | --- | --- |
| PA-01 | RF01, R6 | El tutor entra con contraseña y código 2FA; un código incorrecto no da acceso y avisa cuántos intentos quedan; el reenvío espera 60 s | Pasa |
| PA-02 | RF02, RF03, RNF04 | Se registra al alumno solo con consentimiento y sin pedir nombre real ni correo | Pasa |
| PA-03 | RF04 | El alumno entra con su usuario y clave; una clave incorrecta no da acceso | Pasa |
| PA-04 | RF05 | Se ven 3 niveles y 12 desafíos ordenados por dificultad | Pasa |
| PA-05 | RF06, RF07, RF09 | Arma un programa arrastrando bloques, el robot llega y recibe +10 XP | Pasa (omitida en celular) |
| PA-06 | RF08 | Un error muestra una guía correctiva, sin dar la solución ni XP | Pasa |
| PA-07 | RF11 | El tutor ve el progreso de su alumno | Pasa |
| PA-08 | RF10, R2, R7 | Sin internet la app abre, se resuelve el desafío y sincroniza al volver la conexión | Pasa |
| PA-09 | R2 | Un programa a medio armar sobrevive a recargar la página | Pasa (omitida en celular) |
| PA-10 | RNF01, RNF03 | Retroalimentación en 300 ms o menos con la CPU 6 veces más lenta | Pasa (1 ms o menos) |
| PA-11 | RNF05 | Un ciclo infinito se detiene a los 200 pasos con una guía | Pasa |
| PA-12 | RNF06 | Interfaz en español; un clic desde el menú al desafío | Pasa |
| PA-13 | RNF02 | Menú y desafío sin desplazamiento horizontal en ningún perfil | Pasa |
| PA-13b | RNF02 | El panel del tutor no se desborda con nombres largos | Pasa |
| PA-14 | RNF04 | El navegador del alumno no contacta a terceros | Pasa |

**Límites de esta evidencia:**

- PA-10 mide el Interpretador y el MotorGuias, no la animación, y simula un equipo lento. **No reemplaza probar en un equipo real de 2 GB (RNF03).**
- Los perfiles de tableta y celular emulan pantalla y agente de usuario sobre Chromium. **No equivalen a Safari ni a un dispositivo físico (RNF02).**
- El envío del código 2FA se probó con un proveedor simulado. Falta verificarlo con una cuenta real de Brevo.

## Pruebas manuales pendientes

Marca el resultado y la fecha al ejecutarlas.

| ID | Qué verificar | Dónde | Resultado | Fecha |
| --- | --- | --- | --- | --- |
| PM-01 | Arrastrar bloques con el dedo y resolver un desafío | Celular y tableta físicos | | |
| PM-02 | Recorrer todo el flujo en Safari, iOS 16 o superior | iPhone o iPad | | |
| PM-03 | Recorrer todo el flujo en Chrome, Android 12 o superior | Teléfono Android | | |
| PM-04 | Fluidez y tiempo de retroalimentación con 2 GB de RAM o menos | Equipo escolar | | |
| PM-05 | El código 2FA llega al correo real | Aplicación desplegada | | |
| PM-06 | Modo avión, recarga y sincronización al volver | Aplicación desplegada | | |
| PM-07 | Al menos 80% de 10 jóvenes completa un ejercicio básico sin ayuda (OE4) | Taller de robótica | | |

## Prueba de cargabilidad

Código en `backend/pruebas-carga/carga.ts`; última corrida en [resultados-carga.md](pruebas/resultados-carga.md). Ejecuta el build de producción con el rate limiting relajado para medir la capacidad del sistema. El informe no fijaba un umbral de carga, así que el criterio se definió antes de medir: percentil 97,5 de 1000 ms o menos y 0 errores.

Lectura de la última corrida: todos los escenarios cumplen. El login es el más lento, con unas 170 peticiones por segundo y hasta unos 7 s en el peor caso con 100 conexiones, porque el hash scrypt es costoso a propósito. Con 100 alumnos entrando exactamente al mismo tiempo, algunos esperarían varios segundos.

**Falla intermitente sin explicar.** Se hicieron 3 corridas completas. En la primera, `POST /api/progreso/sincronizar` con 100 conexiones dio 5460 respuestas con error (máximo de 8650 ms). No se repitió en las otras 2 corridas completas ni en 6 rondas aisladas de 100 conexiones. Esa primera corrida no guardaba el registro del servidor, por lo que **la causa no se conoce**. Ahora el registro queda en `backend/pruebas-carga/servidor.log`. El escenario es además extremo, porque las 100 conexiones escriben sobre el mismo alumno.

Estos números corresponden a un computador de 16 núcleos con todo en la misma máquina. **El hosting gratuito rendirá bastante menos**, así que la prueba debe repetirse contra la aplicación desplegada antes de citarla como capacidad real.
