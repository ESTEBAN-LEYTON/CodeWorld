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
el backend solo autentica al tutor y persiste el progreso.

## Probarlo en línea

La aplicación está publicada en **https://codeworld-c237.onrender.com**. Si nadie la usó en los últimos 15 minutos,
la primera carga tarda cerca de un minuto, porque el plan gratuito de Render suspende el servicio.

En la versión en línea, el código de verificación del tutor queda en los registros (**Logs**) del servicio en Render,
que solo ve el dueño del proyecto. Para probarla sin acceso a Render, pide el código o un alumno de prueba.
Más detalles en [`docs/despliegue.md`](docs/despliegue.md).

## Guía para levantar el proyecto en tu computador

### 1. Instala los requisitos

| Programa | Versión | Para qué |
| --- | --- | --- |
| [Git](https://git-scm.com/downloads) | cualquiera reciente | Descargar el repositorio |
| [Node.js](https://nodejs.org) | **24 o superior** (`node -v`) | Ejecutar el frontend y el backend |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) o [Podman](https://podman.io) | cualquiera reciente | Levantar PostgreSQL 17 con un comando |

Si prefieres no usar Docker, puedes instalar [PostgreSQL 17](https://www.postgresql.org/download/) directamente (ver el paso 4, opción B).

### 2. Descarga el repositorio

El repositorio es privado: el dueño debe invitarte como colaborador en GitHub.

```bash
git clone https://github.com/ESTEBAN-LEYTON/CodeWorld.git
cd CodeWorld
```

### 3. Instala las dependencias

```bash
npm run install:all
```

Instala el frontend, el backend y las pruebas e2e, y genera el cliente de Prisma. Tarda unos minutos la primera vez.

### 4. Levanta la base de datos

**Opción A: Docker o Podman (recomendada).** Con Docker Desktop abierto:

```bash
docker compose up -d        # o: podman compose up -d
```

Deja PostgreSQL en `localhost:5432` con usuario `codeworld`, clave `codeworld` y dos bases: `codeworld` (la de la app)
y `codeworld_test` (la de las pruebas). Los datos se guardan en un volumen, así que sobreviven a reinicios.
Para detenerla: `docker compose down`.

**Opción B: PostgreSQL instalado en el computador.** Abre `psql` como administrador y crea el usuario y las bases:

```sql
CREATE USER codeworld WITH PASSWORD 'codeworld';
CREATE DATABASE codeworld OWNER codeworld;
CREATE DATABASE codeworld_test OWNER codeworld;
```

### 5. Configura las variables del backend

```bash
cp backend/.env.example backend/.env      # en Windows (PowerShell): copy backend\.env.example backend\.env
```

Abre `backend/.env` y cambia `JWT_SECRET` por un valor aleatorio largo. Puedes generarlo con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Los demás valores ya sirven para el paso 4. `.env` nunca se sube al repositorio.

### 6. Crea las tablas y carga los desafíos

```bash
npm run db:setup
```

Aplica las migraciones y carga los 3 niveles, los 18 desafíos y sus guías. Se puede repetir sin perder el progreso guardado.

### 7. Inicia la aplicación

En **dos terminales**, ambas en la carpeta `CodeWorld`:

```bash
npm run dev:backend        # terminal 1: API en http://localhost:3000/api
npm run dev:frontend       # terminal 2: aplicación en http://localhost:5173
```

Abre **http://localhost:5173**. Para comprobar la API: http://localhost:3000/api/health debe responder `"baseDeDatos": "ok"`.
Deja abierta la terminal 1: ahí aparecerán los códigos de verificación.

## Crear usuarios

En CodeWorld solo el **tutor** (el adulto responsable) crea una cuenta. Los **alumnos** no se registran solos:
el tutor los crea desde su panel, sin pedirles nombre real ni correo.

### Tutor, con verificación en dos pasos (2FA)

1. En la portada, elige **Soy tutor** y luego **Crear cuenta de tutor**.
2. Completa el formulario y aprieta **Crear cuenta**:
   - **Usuario:** de 3 a 30 caracteres; solo letras, números, punto, guion y guion bajo.
   - **Correo:** a esta dirección se envían los códigos de verificación.
   - **Contraseña:** al menos 6 caracteres, escrita 2 veces.
3. Inicia sesión con el usuario y la contraseña, y aprieta **Continuar**.
4. Aparece **Verificación en dos pasos**, que pide un código de 6 dígitos. Dónde encontrarlo:
   - **En tu computador:** en la terminal del backend (la terminal 1), en una línea como
     `[2FA] Código para tu*************cl: 482913 (válido 10 minutos)`.
   - **En Render:** en el servicio, sección **Logs**, en la misma línea `[2FA] Código para …`.
   - **Por correo:** solo si están configuradas `BREVO_API_KEY` y `CORREO_REMITENTE` (ver más abajo).
5. Escribe el código y aprieta **Verificar**. Entras al **Panel del tutor**.

Reglas del código:

- Vence a los **10 minutos** y sirve **una sola vez**.
- Admite **5 intentos**; después hay que iniciar sesión de nuevo para recibir otro.
- **Reenviar código** se habilita a los 60 segundos y anula el código anterior.

### Alumnos

1. En el **Panel del tutor**, aprieta **+ Registrar alumno**.
2. Completa los datos:
   - **Usuario del alumno:** las mismas reglas que el del tutor, por ejemplo `gato_rapido`.
   - **Clave:** al menos 6 caracteres.
   - **Edad:** de 9 a 15 años.
   - **Consentimiento:** marca la casilla en que autorizas el uso de CodeWorld (Ley N.º 19.628). Es obligatoria.
3. Para jugar: cierra sesión, elige **Soy alumno**, escribe el usuario y la clave, y aprieta **Entrar a jugar**.
   El alumno no usa 2FA.
4. Para ver el avance, vuelve a entrar como tutor y aprieta **Ver progreso** en la fila del alumno.

### Recibir el código por correo (opcional)

Sin configuración, el código solo aparece en la terminal o en los registros. Para que llegue al correo del tutor:

1. Crea una cuenta gratuita en [Brevo](https://www.brevo.com) y verifica el correo remitente en **Senders**.
2. Crea una clave en **SMTP & API → API Keys**.
3. Agrega a `backend/.env` (o a **Environment** en Render):
   ```
   BREVO_API_KEY=tu-clave
   CORREO_REMITENTE=correo-verificado@ejemplo.com
   ```
4. Reinicia el backend.

## Si algo falla

| Problema | Solución |
| --- | --- |
| `npm run db:setup` no se conecta | Revisa que PostgreSQL esté corriendo (`docker compose ps`) y que `DATABASE_URL` en `backend/.env` coincida. |
| El puerto 5432 está ocupado | Ya tienes otro PostgreSQL corriendo: usa la opción B del paso 4, o detenlo. |
| La app abre, pero no carga los niveles | El backend no está corriendo: revisa la terminal 1. |
| No aparece el código 2FA | Búscalo en la terminal 1, no en la del frontend. Si pasaron 10 minutos o 5 intentos, inicia sesión de nuevo. |
| «Ese nombre de usuario ya existe» | Otro tutor (o alumno) ya lo usa: elige otro. |
| Quiero empezar con la base vacía | `docker compose down -v` borra el volumen; luego repite los pasos 4 y 6. |

## Pruebas

```bash
npm test                   # frontend (intérprete, guías, progreso) + backend (seguridad y API)
npm run test:e2e           # aceptación en navegador real (la primera vez: npx --prefix e2e playwright install chromium)
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
| MotorGuias: guía correctiva por desafío y patrón de error, 100% de cobertura en los 18 desafíos (OE3) | ✅ |
| 3 niveles y 18 desafíos (6 por nivel) servidos desde PostgreSQL (ServicioContenido), con caché sin conexión | ✅ |
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
| Código 2FA por correo con Brevo: implementado; en producción, el código queda en los registros de Render | 🔶 |
| Despliegue en Render y Neon, en https://codeworld-c237.onrender.com ([`docs/despliegue.md`](docs/despliegue.md)) | ✅ |
| Pruebas manuales en dispositivos físicos, incluido Safari (OE2) | ✅ |
| Validación con 30 jóvenes de 9 a 15 años (OE4) | ⏳ |
