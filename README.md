# CodeWorld

Plataforma web que enseña programación a jóvenes de 9 a 15 años mediante desafíos visuales con bloques
(Google Blockly), retroalimentación inmediata y gamificación.

Proyecto de título — Ingeniería en Computación e Informática, Universidad Andrés Bello.
Autor: Esteban Ignacio Leyton Miranda · Profesora guía: Alfonsina del Mar Linarez Castañeda.

## Estructura

```
CodeWorld/
├── docs/        Plan y resultados de pruebas, guía de despliegue
├── e2e/         Pruebas de aceptación en navegador real (Playwright)
├── frontend/    React + Vite + TypeScript + Blockly (evaluación local en el navegador)
└── backend/     Node + Express + TypeScript + Prisma (PostgreSQL)
```

La decisión central de la arquitectura es que **los bloques se evalúan en el navegador del alumno**:
el backend solo autentica al tutor y persiste el progreso. El detalle está en el Capítulo IV del informe
(`Formato_Portafolio_de_Proyecto_Final_2026.docx`).

## Requisitos

- Node.js 24 o superior
- PostgreSQL 17. La forma más simple es Docker o Podman con el `compose.yaml` del repositorio.

## Cómo ejecutar

```bash
npm run install:all                     # instala frontend y backend (genera el cliente de Prisma)

docker compose up -d                    # o: podman compose up -d  -> PostgreSQL en localhost:5432
cp backend/.env.example backend/.env    # y cambiar JWT_SECRET por un valor aleatorio largo
npm run db:setup                        # crea las tablas (migraciones) y carga niveles, desafíos y guías

npm run dev:backend                     # API en http://localhost:3000/api
npm run dev:frontend                    # App en http://localhost:5173
```

### Flujo de prueba

1. Entra en http://localhost:5173 → **Soy tutor** → **Crear cuenta de tutor**.
2. Inicia sesión. El **código de verificación (2FA)** aparece en la consola del backend
   (`[2FA] Código para …`), porque sin `BREVO_API_KEY` no se envían correos.
3. En el panel, **+ Registrar alumno**: usuario, clave, edad y consentimiento.
4. Cierra sesión → **Soy alumno** → entra con el usuario del alumno y resuelve desafíos.
5. Vuelve a entrar como tutor → **Ver progreso**.

## Pruebas

```bash
npm test                   # frontend (intérprete, guías, progreso) + backend (seguridad y API)
npm run test:e2e           # aceptación en navegador real, en computador, tableta y celular
npm run test:carga         # cargabilidad de la API
```

El plan, la matriz de requerimientos y los resultados están en [`docs/pruebas.md`](docs/pruebas.md).

Las pruebas de la API usan una base de datos aparte (`TEST_DATABASE_URL`, que se vacía en cada ejecución).
`compose.yaml` la crea automáticamente. Sin esa variable, esas pruebas se omiten.

## Estado

| Módulo | Estado |
| --- | --- |
| Editor de bloques en español (avanzar, girar, repetir, repetir hasta la meta, si hay camino) | ✅ |
| Interpretador local en el navegador, límite de 200 pasos, estados EXITO/REINTENTO/ERROR | ✅ |
| MotorGuias: guía correctiva por desafío y patrón de error, 100% de cobertura en los 12 desafíos (OE3) | ✅ |
| 3 niveles y 12 desafíos (4 por nivel) servidos desde PostgreSQL (ServicioContenido), con caché sin conexión | ✅ |
| ApiGateway: CORS, rate limiting (más estricto en login), cabeceras de seguridad, errores en JSON | ✅ |
| ServicioAutenticacion: registro y login del tutor con 2FA, registro de alumno con consentimiento, login del alumno | ✅ |
| 2FA reforzado (R6): 5 intentos por código, un solo uso y reenvío con espera de 60 s | ✅ |
| ServicioProgreso: sincronización por lotes idempotente, XP por desafío, panel de progreso del tutor | ✅ |
| GestorProgreso: progreso en localStorage, sincronización automática al recuperar conexión (R2) | ✅ |
| Interfaz web responsiva (computador, tableta y celular), con diseño de juego: robot, tablero en relieve y un color por nivel | ✅ |
| Menú principal del alumno: niveles con avance, bloques que enseña cada uno y «Continuar donde quedé» | ✅ |
| Tutoriales guiados la primera vez (menú, desafío y panel del tutor), repetibles desde «¿Cómo se juega?» y «Ayuda» (R5) | ✅ |
| Explicación animada de cada bloque nuevo, con ejemplo armado y mini laberinto | ✅ |
| Autoguardado del programa a medio armar y apertura sin conexión con service worker (R2, R7) | ✅ |
| Pruebas funcionales, de integración, de carga y de aceptación automatizadas | ✅ |
| Código 2FA por correo con Brevo: implementado, falta probarlo con una cuenta real | 🔶 |
| Despliegue en hosting: guía lista en [`docs/despliegue.md`](docs/despliegue.md), falta ejecutarlo | ⏳ |
| Pruebas manuales en dispositivos físicos (iOS, Android, gama baja) | ⏳ |
| Pruebas de usabilidad con el grupo de control (OE4) | ⏳ |
