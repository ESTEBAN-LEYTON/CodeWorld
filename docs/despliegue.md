# Despliegue de CodeWorld

La aplicación queda en tres piezas separadas, como en la Figura 9 del informe. **Aún no está desplegada:** estos pasos requieren crear cuentas a nombre del autor, y no se han probado en esos servicios. Lo que sí está probado localmente es el build de producción (`node dist/index.js` y `vite preview`).

| Pieza | Servicio recomendado | Alternativas |
| --- | --- | --- |
| Base de datos PostgreSQL | Neon | Render PostgreSQL, Supabase |
| API (Node.js) | Render, Web Service | Railway, Fly.io |
| Frontend estático | Render, Static Site | Netlify, Cloudflare Pages, Vercel |
| Correo del 2FA | Brevo (API HTTP) | Resend, si se tiene un dominio propio |

Antes de empezar, conviene confirmar los límites vigentes de cada plan gratuito. El plan gratuito de Render suspende el servicio tras un período sin uso, por lo que la primera petición puede tardar. **Abre la aplicación unos minutos antes de cada prueba con alumnos.**

## 1. Base de datos

Crea la base y copia su cadena de conexión. Desde tu computador, aplica las migraciones y carga los desafíos:

```bash
cd backend
DATABASE_URL="<cadena de conexión>" npm run db:deploy
DATABASE_URL="<cadena de conexión>" npm run db:seed
```

## 2. API

- **Directorio raíz:** `backend`
- **Build:** `npm ci --include=dev && npm run build`
- **Inicio:** `npm start`
- **Comprobación de salud:** `/api/health`

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | La cadena de conexión de la base |
| `JWT_SECRET` | Un valor aleatorio largo: `openssl rand -base64 48` |
| `CORS_ORIGIN` | La URL del frontend, sin `/` final |
| `SALTOS_PROXY` | `1`. Sin esto, todos los usuarios cuentan como una sola IP en el rate limiting |
| `BREVO_API_KEY` | La clave de la API de Brevo |
| `CORREO_REMITENTE` | El remitente verificado en Brevo |

Sin las dos últimas variables la API funciona igual, pero el código 2FA queda en los registros del servidor.

## 3. Frontend

- **Directorio raíz:** `frontend`
- **Build:** `npm ci && npm run build`
- **Directorio publicado:** `dist`
- **Variable de build:** `VITE_API_URL=https://<url-de-la-api>/api`

El service worker exige HTTPS, que estos servicios entregan por defecto.

## 4. Verificación

1. `https://<url-de-la-api>/api/health` responde `baseDeDatos: ok`.
2. Crea una cuenta de tutor con tu correo real y confirma que el código llega.
3. Registra un alumno, resuelve un desafío y revisa su progreso en el panel del tutor.
4. Con el desafío abierto, activa el modo avión, recarga la página y resuelve otro desafío. Al volver la conexión, debe sincronizarse.

## Antes de la prueba con alumnos

El rate limiting se cuenta por IP, y una sala completa suele compartir la misma IP pública. El límite por defecto es de 20 intentos de login por minuto: alcanza para 10 alumnos, pero para una sala de 30 o más conviene definir `LIMITE_API=1000` y `LIMITE_LOGIN=100`.
