import { Router } from 'express'
import { z } from 'zod'
import type { Db } from '../db.js'
import type { Sesion, Tokens } from '../seguridad/tokens.js'
import { validar } from './validacion.js'

// ServicioProgreso: recibe por lotes el progreso guardado en el navegador (GestorProgreso.sincronizar)
// y responde las consultas del tutor. El XP lo fija el servidor desde DESAFIO.xp_recompensa.

const MAX_LOTE = 100

export function servicioProgreso(db: Db, tokens: Tokens) {
  const r = Router()

  const resumen = async (alumnoId: string) => {
    const [registros, desafios] = await Promise.all([
      db.progreso.findMany({ where: { alumnoId }, orderBy: { completadoEn: 'asc' } }),
      db.desafio.findMany({ select: { id: true, nivelId: true } }),
    ])
    const hechos = new Set(registros.map((p) => p.desafioId))
    const porNivel = new Map<string, string[]>()
    for (const d of desafios) porNivel.set(d.nivelId, [...(porNivel.get(d.nivelId) ?? []), d.id])
    return {
      xpTotal: registros.reduce((s, p) => s + p.xpObtenido, 0),
      desafiosCompletados: registros.length,
      totalDesafios: desafios.length,
      // Un nivel está completo si todos sus desafíos tienen progreso: se calcula, no se almacena.
      nivelesCompletados: [...porNivel].filter(([, ids]) => ids.every((id) => hechos.has(id))).map(([id]) => id),
      registros: registros.map((p) => ({
        desafioId: p.desafioId,
        completadoEn: p.completadoEn,
        xpObtenido: p.xpObtenido,
        intentos: p.intentos,
      })),
    }
  }

  r.get('/progreso', tokens.exigir('alumno'), async (_req, res) => {
    res.json(await resumen((res.locals.sesion as Sesion).sub))
  })

  r.post(
    '/progreso/sincronizar',
    tokens.exigir('alumno'),
    validar(
      z.object({
        registros: z
          .array(
            z.object({
              desafioId: z.string().min(1).max(60),
              completadoEn: z.coerce.date(),
              intentos: z.number().int().min(1).max(10_000),
            }),
          )
          .max(MAX_LOTE),
      }),
    ),
    async (req, res) => {
      const alumnoId = (res.locals.sesion as Sesion).sub
      if (!(await db.alumno.findUnique({ where: { id: alumnoId }, select: { id: true } }))) {
        return res.status(401).json({ error: 'La cuenta del alumno ya no existe' })
      }
      const registros: { desafioId: string; completadoEn: Date; intentos: number }[] = req.body.registros
      const desafios = await db.desafio.findMany({
        where: { id: { in: registros.map((x) => x.desafioId) } },
        select: { id: true, xpRecompensa: true },
      })
      const xpDe = new Map(desafios.map((d) => [d.id, d.xpRecompensa]))
      const ahora = new Date()
      const validos = registros.filter((x) => xpDe.has(x.desafioId))
      // Idempotente: reenviar el mismo lote no duplica XP; se conserva la primera fecha de logro.
      await db.$transaction(
        validos.map((x) =>
          db.progreso.upsert({
            where: { alumnoId_desafioId: { alumnoId, desafioId: x.desafioId } },
            create: {
              alumnoId,
              desafioId: x.desafioId,
              completadoEn: x.completadoEn > ahora ? ahora : x.completadoEn,
              xpObtenido: xpDe.get(x.desafioId)!,
              intentos: x.intentos,
            },
            update: { intentos: x.intentos },
          }),
        ),
      )
      res.json({ aceptados: validos.map((x) => x.desafioId), rechazados: registros.length - validos.length, ...(await resumen(alumnoId)) })
    },
  )

  r.get('/tutor/alumnos', tokens.exigir('tutor'), async (_req, res) => {
    const tutorId = (res.locals.sesion as Sesion).sub
    const [alumnos, total] = await Promise.all([
      db.alumno.findMany({
        where: { tutorId },
        orderBy: { createdAt: 'asc' },
        include: { progresos: { select: { xpObtenido: true } } },
      }),
      db.desafio.count(),
    ])
    res.json(
      alumnos.map((a) => ({
        id: a.id,
        username: a.username,
        edad: a.edad,
        xpTotal: a.progresos.reduce((s, p) => s + p.xpObtenido, 0),
        desafiosCompletados: a.progresos.length,
        totalDesafios: total,
      })),
    )
  })

  r.get('/tutor/alumnos/:id/progreso', tokens.exigir('tutor'), async (req, res) => {
    const tutorId = (res.locals.sesion as Sesion).sub
    const id = z.uuid().safeParse(req.params.id)
    const alumno = id.success ? await db.alumno.findFirst({ where: { id: id.data, tutorId } }) : null
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' })
    res.json({ alumno: { id: alumno.id, username: alumno.username, edad: alumno.edad }, ...(await resumen(alumno.id)) })
  })

  return r
}
