# Despliegue de CodeWorld

CodeWorld se despliega como **un solo Web Service de Render** que sirve la API y la aplicación web desde la misma dirección, más una base de datos PostgreSQL en **Neon**. Todo está definido en [`render.yaml`](../render.yaml), en la raíz del repositorio.

| Pieza | Servicio | Plan |
| --- | --- | --- |
| API y aplicación web | Render, Web Service `codeworld` | Gratuito |
| Base de datos PostgreSQL | Neon | Gratuito, sin vencimiento |
| Correo del 2FA | Brevo (API HTTP) | Opcional: sin Brevo, el código queda en los registros |

Esta forma de despliegue está probada localmente: `E2E_UN_SERVIDOR=1 npm run test:e2e` corre las 15 pruebas de aceptación contra la API sirviendo el build del frontend, igual que en Render.

**El plan gratuito de Render suspende el servicio tras 15 minutos sin uso**, y la primera visita después tarda cerca de un minuto en responder. Abre la aplicación unos minutos antes de cada prueba con alumnos.

## 1. Base de datos en Neon

1. Crea una cuenta en [neon.tech](https://neon.tech) y un proyecto llamado `codeworld`.
2. **Región:** AWS US East 1 (N. Virginia), la misma del servicio de Render.
3. En **Connect**, desactiva **Connection pooling** y copia la cadena de conexión. Empieza con `postgresql://` y termina en `?sslmode=require`.

No hace falta correr nada en tu computador: las migraciones y los desafíos se cargan en cada despliegue.

## 2. Servicio en Render

1. Crea una cuenta en [render.com](https://render.com) entrando con GitHub.
2. **New → Blueprint** y elige el repositorio `CodeWorld`. Como es privado, autoriza a Render a leerlo cuando lo pida.
3. Render lee `render.yaml` y pide **`DATABASE_URL`**: pega la cadena de Neon.
4. **Deploy Blueprint.** El primer despliegue tarda unos 5 minutos: compila el frontend y la API, crea las tablas y carga los 18 desafíos.

`JWT_SECRET` lo genera Render. No hace falta configurar CORS porque la app y la API comparten la dirección.

Cada `git push` a `main` vuelve a desplegar.

## 3. Verificación

La dirección queda como `https://codeworld.onrender.com`, o con un sufijo si el nombre ya existe.

1. `https://<dirección>/api/health` responde `"baseDeDatos": "ok"`.
2. Abre la dirección, entra como **Soy tutor** y crea tu cuenta.
3. Al iniciar sesión, busca el código en **Logs** del servicio, en la línea `[2FA] Código para …`.
4. Registra un alumno, entra como alumno, resuelve un desafío y revisa su progreso en el panel del tutor.
5. Con un desafío abierto, activa el modo avión, recarga la página y resuelve otro. Al volver la conexión, el progreso debe sincronizarse (PM-06).

## 4. Correo del 2FA con Brevo (opcional)

Mientras no lo configures, el código aparece en los registros, lo que sirve para la demo. Para que llegue al correo:

1. Crea una cuenta en [brevo.com](https://www.brevo.com).
2. En **Senders**, agrega y verifica el correo que enviará los códigos.
3. En **SMTP & API → API Keys**, crea una clave.
4. En Render, **Environment** del servicio, agrega `BREVO_API_KEY` y `CORREO_REMITENTE`, y guarda. El servicio se reinicia solo.

**Sin confirmar:** que el plan gratuito de Brevo acepte un remitente de Gmail sin dominio propio. Si los correos no llegan, revisa la carpeta de spam y los registros de Brevo.

## Variables del servicio

| Variable | Valor | Para qué |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de Neon | Conexión a la base |
| `JWT_SECRET` | Generado por Render | Firma de las sesiones y los códigos 2FA |
| `CARPETA_FRONTEND` | `../frontend/dist` | La API sirve la aplicación web |
| `SALTOS_PROXY` | `1` | Sin esto, todos los usuarios cuentan como una sola IP |
| `LIMITE_API`, `LIMITE_LOGIN` | `1000` y `100` | Peticiones por minuto e IP; una sala comparte la IP pública |
| `BREVO_API_KEY`, `CORREO_REMITENTE` | Opcionales | Correo real del 2FA |

## Si algo falla

- **El build falla en `db:deploy`:** la cadena de Neon está mal copiada o usa el *pooler*. Usa la conexión directa.
- **`/api/health` responde `sin conexión`:** revisa `DATABASE_URL` en **Environment**.
- **No veo el código 2FA:** en **Logs**, busca `[2FA]`. Los intentos fallidos y los reenvíos se cuentan en la memoria del servidor, así que un reinicio los borra.
- **Los alumnos no ven una versión nueva:** el service worker revalida la página en cada visita; basta con recargar una vez.
