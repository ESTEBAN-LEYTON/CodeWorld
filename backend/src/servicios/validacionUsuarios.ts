import { randomInt, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import type { Db } from '../db.js'
import { validar } from './validacion.js'

// TEMPORAL (validación con cliente simulado, noviembre de 2026).
// Recibe las respuestas anónimas de /validacion y se las entrega a quien tenga la clave.
// Solo se monta si existe VALIDACION_CLAVE; para apagarlo basta con borrar esa variable.

const likert = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable()
const texto = (max: number) => z.string().trim().max(max)
const ms = z.number().int().min(0).max(24 * 3_600_000)

export const esquemaRespuesta = z.object({
  version: z.literal(1),
  perfil: z.object({
    rol: z.enum(['docente', 'apoderado', 'estudiante', 'otro']),
    experiencia: z.enum(['ninguna', 'basica', 'avanzada']),
    trabajaConNinos: z.boolean(),
    dispositivo: z.enum(['computador', 'tableta', 'celular']),
    navegador: texto(40),
  }),
  desafios: z
    .array(
      z.object({
        id: texto(60),
        titulo: texto(80),
        resuelto: z.boolean(),
        intentos: z.number().int().min(0).max(1000),
        patrones: z.array(z.enum(['vacio', 'choque', 'incompleto', 'limite_pasos'])).max(1000),
        msHastaPrimeraEjecucion: ms.nullable(),
        msHastaResolver: ms.nullable(),
      }),
    )
    .min(1)
    .max(10),
  msTotal: ms,
  ayudaExterna: z.enum(['no', 'una', 'varias']),
  likert: z.record(z.string().regex(/^C\d{1,2}$/), likert),
  abiertas: z.record(z.string().regex(/^D\d$/), texto(1000)),
})

function nuevoCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'P-' + Array.from({ length: 4 }, () => letras[randomInt(letras.length)]).join('')
}

function claveCorrecta(recibida: string | undefined, clave: string) {
  if (!recibida) return false
  const a = Buffer.from(recibida)
  const b = Buffer.from(clave)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function servicioValidacionUsuarios(db: Db, clave: string) {
  const r = Router()

  r.post('/validacion', validar(esquemaRespuesta), async (req, res) => {
    for (let i = 0; i < 5; i++) {
      const codigo = nuevoCodigo()
      try {
        await db.validacionRespuesta.create({ data: { codigo, datos: req.body } })
        return res.status(201).json({ codigo })
      } catch (e) {
        if ((e as { code?: string }).code !== 'P2002') throw e
      }
    }
    res.status(503).json({ error: 'No se pudo guardar la respuesta. Intenta de nuevo.' })
  })

  r.get('/validacion/resultados', async (req, res) => {
    if (!claveCorrecta(req.get('x-clave-validacion'), clave)) return res.status(401).json({ error: 'Clave incorrecta' })
    const filas = await db.validacionRespuesta.findMany({ orderBy: { creadoEn: 'asc' } })
    res.json(filas.map((f) => ({ codigo: f.codigo, creadoEn: f.creadoEn, ...(f.datos as object) })))
  })

  return r
}
