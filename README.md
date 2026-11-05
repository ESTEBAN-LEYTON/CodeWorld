# CodeWorld

Plataforma web que enseña programación a jóvenes de 9 a 15 años mediante desafíos visuales con bloques
(Google Blockly), retroalimentación inmediata y gamificación.

Proyecto de título — Ingeniería en Computación e Informática, Universidad Andrés Bello.
Autor: Esteban Ignacio Leyton Miranda · Profesora guía: Alfonsina del Mar Linarez Castañeda.

## Estructura

```
CodeWorld/
├── docs/        Informe del proyecto de título
├── frontend/    React + Vite + TypeScript + Blockly (evaluación local en el navegador)
└── backend/     Node + Express + TypeScript + Prisma (PostgreSQL)
```

La decisión central de la arquitectura es que **los bloques se evalúan en el navegador del alumno**:
el backend solo autentica al tutor y persiste el progreso. Ver [`docs/arquitectura.md`](docs/arquitectura.md).

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
   (`[2FA] Código para …`), porque en desarrollo no se envían correos ni SMS.
3. En el panel, **+ Registrar alumno**: usuario, clave, edad y consentimiento.
4. Cierra sesión → **Soy alumno** → entra con el usuario del alumno y resuelve desafíos.
5. Vuelve a entrar como tutor → **Ver progreso**.

## Pruebas

```bash
npm test                   # frontend (intérprete, guías, progreso) + backend (seguridad y API)
```

Las pruebas de la API usan una base de datos aparte (`TEST_DATABASE_URL`, que se vacía en cada ejecución).
`compose.yaml` la crea automáticamente. Sin esa variable, esas pruebas se omiten.

## Estado

| Módulo | Estado |
| --- | --- |
| Editor de bloques en español (avanzar, girar, repetir, repetir hasta la meta, si hay camino) | ✅ |
| Interpretador local en el navegador, límite de 200 pasos, estados EXITO/REINTENTO/ERROR | ✅ |
| MotorGuias: guía correctiva por desafío y patrón de error, 100% de cobertura en el nivel inicial (OE3) | ✅ |
| 3 niveles y 6 desafíos servidos desde PostgreSQL (ServicioContenido), con caché sin conexión | ✅ |
| ApiGateway: CORS, rate limiting (más estricto en login), cabeceras de seguridad, errores en JSON | ✅ |
| ServicioAutenticacion: registro y login del tutor con 2FA, registro de alumno con consentimiento, login del alumno | ✅ |
| ServicioProgreso: sincronización por lotes idempotente, XP por desafío, panel de progreso del tutor | ✅ |
| GestorProgreso: progreso en localStorage, sincronización automática al recuperar conexión (R2) | ✅ |
| Interfaz web responsiva (computador, tableta y celular) | ✅ |
| Menú principal del alumno: niveles con avance, bloques que enseña cada uno y «Continuar donde quedé» | ✅ |
| Tutoriales guiados la primera vez (menú, desafío y panel del tutor), repetibles desde «¿Cómo se juega?» y «Ayuda» (R5) | ✅ |
| Explicación animada de cada bloque nuevo, con ejemplo armado y mini laberinto | ✅ |
| Envío real del código 2FA por correo/SMS (hoy se muestra en la consola del servidor) | ⏳ |
| Más desafíos por nivel | ⏳ |
| Funcionamiento offline al recargar la página (service worker / PWA) | ⏳ |
| Despliegue en hosting (frontend estático + servidor Node.js + PostgreSQL) | ⏳ |
| Pruebas de usabilidad con el grupo de control (OE4) | ⏳ |
