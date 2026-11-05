import { Router } from 'express'
import type { Db } from '../db.js'

// ServicioContenido: niveles, desafíos y guías correctivas. Es público porque no contiene
// datos personales; el navegador lo guarda en caché para seguir jugando sin conexión.

export function servicioContenido(db: Db) {
  const r = Router()

  r.get('/niveles', async (_req, res) => {
    const niveles = await db.nivel.findMany({
      orderBy: { orden: 'asc' },
      include: {
        desafios: {
          orderBy: { orden: 'asc' },
          include: { guias: { orderBy: { orden: 'asc' }, select: { patronError: true, mensaje: true, orden: true } } },
        },
      },
    })
    res.json(
      niveles.map((n) => ({
        id: n.id,
        orden: n.orden,
        titulo: n.titulo,
        descripcion: n.descripcion,
        desafios: n.desafios.map(({ nivelId: _nivelId, ...d }) => d),
      })),
    )
  })

  return r
}
