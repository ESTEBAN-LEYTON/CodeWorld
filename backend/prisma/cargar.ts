import type { Db } from '../src/db.js'
import { guiasDe, NIVELES } from './contenido.js'

/** Carga o actualiza niveles, desafíos y guías. Idempotente: no toca el progreso de los alumnos. */
export async function cargarContenido(db: Db) {
  for (const [i, n] of NIVELES.entries()) {
    const nivel = { orden: i + 1, titulo: n.titulo, descripcion: n.descripcion }
    await db.nivel.upsert({ where: { id: n.id }, create: { id: n.id, ...nivel }, update: nivel })
    for (const [j, d] of n.desafios.entries()) {
      const datos = {
        nivelId: n.id,
        orden: j + 1,
        titulo: d.titulo,
        enunciado: d.enunciado,
        laberinto: d.laberinto,
        bloquesPermitidos: d.bloquesPermitidos,
        bloquesOptimos: d.bloquesOptimos ?? null,
        xpRecompensa: d.xpRecompensa,
      }
      await db.desafio.upsert({ where: { id: d.id }, create: { id: d.id, ...datos }, update: datos })
      await db.guiaCorrectiva.deleteMany({ where: { desafioId: d.id } })
      await db.guiaCorrectiva.createMany({
        data: guiasDe(d).map((g, k) => ({ desafioId: d.id, patronError: g.patronError, mensaje: g.mensaje, orden: k + 1 })),
      })
    }
  }
  return { niveles: NIVELES.length, desafios: NIVELES.reduce((s, n) => s + n.desafios.length, 0) }
}
