import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// API Gateway (diagrama de despliegue): CORS, rate limiting y enrutamiento.
// La evaluación de bloques NO ocurre aquí: se ejecuta en el navegador del alumno.

export function crearApp(origenPermitido = process.env.CORS_ORIGIN ?? 'http://localhost:5173') {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: origenPermitido }))
  app.use(express.json({ limit: '100kb' }))
  app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }))

  app.get('/api/health', (_req, res) => {
    res.json({ estado: 'ok', servicio: 'codeworld-api' })
  })

  // Próximos módulos (ver docs/arquitectura.md):
  // app.use('/api/auth', authRouter)          -> AuthService (JWT + 2FA del tutor)
  // app.use('/api/desafios', desafiosRouter)  -> ChallengeService
  // app.use('/api/progreso', progresoRouter)  -> ProgressService

  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
  })

  return app
}
