import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import type { Db } from './db.js'
import { Tokens } from './seguridad/tokens.js'
import { servicioAutenticacion } from './servicios/autenticacion.js'
import { servicioContenido } from './servicios/contenido.js'
import { enviadorConsola, type EnviadorCodigo } from './servicios/mensajeria.js'
import { servicioProgreso } from './servicios/progreso.js'

// ApiGateway (Figuras 6 y 9): CORS, rate limiting, cabeceras de seguridad y enrutamiento
// hacia ServicioAutenticacion, ServicioContenido y ServicioProgreso.
// La evaluación de bloques NO ocurre aquí: se ejecuta en el navegador del alumno.

export interface Opciones {
  db: Db
  jwtSecret: string
  origenPermitido?: string
  enviador?: EnviadorCodigo
  /** Peticiones por minuto e IP a /api y a los endpoints de login. */
  limites?: { api: number; login: number }
  /** Saltos de proxy delante de la API (hosting): sin esto, todos los usuarios comparten la IP del proxy. */
  saltosProxy?: number
}

export function crearApp({
  db,
  jwtSecret,
  origenPermitido = process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  enviador = enviadorConsola,
  limites = { api: 300, login: 20 },
  saltosProxy = 0,
}: Opciones) {
  const app = express()
  app.set('trust proxy', saltosProxy)
  const tokens = new Tokens(jwtSecret)

  app.use(helmet())
  app.use(cors({ origin: origenPermitido }))
  app.use(express.json({ limit: '100kb' }))
  const limitar = (limit: number) => rateLimit({ windowMs: 60_000, limit, standardHeaders: 'draft-8', legacyHeaders: false })
  app.use('/api', limitar(limites.api))
  // Límite más estricto contra fuerza bruta de contraseñas y códigos 2FA.
  app.use(['/api/auth/tutor/login', '/api/auth/tutor/verificar', '/api/auth/alumno/login'], limitar(limites.login))

  app.get('/api/health', async (_req, res) => {
    try {
      await db.$queryRaw`SELECT 1`
      res.json({ estado: 'ok', servicio: 'codeworld-api', baseDeDatos: 'ok' })
    } catch {
      res.status(503).json({ estado: 'degradado', servicio: 'codeworld-api', baseDeDatos: 'sin conexión' })
    }
  })

  app.use('/api', servicioAutenticacion(db, tokens, enviador))
  app.use('/api', servicioContenido(db))
  app.use('/api', servicioProgreso(db, tokens))

  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
  })

  // Express 5 entrega aquí también los errores de los handlers async.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'JSON mal formado' })
    console.error(err)
    res.status(500).json({ error: 'Error interno del servidor' })
  })

  return app
}
