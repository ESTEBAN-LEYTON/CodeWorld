import { describe, expect, it } from 'vitest'
import { guiasDe, NIVELES } from '../../../backend/prisma/contenido'
import { seleccionar } from './motorGuias'
import type { GuiaCorrectiva, PatronError } from './types'

const PATRONES: PatronError[] = ['vacio', 'choque', 'incompleto', 'limite_pasos']

describe('MotorGuias.seleccionar', () => {
  it('elige la guía del patrón de error con menor orden', () => {
    const guias: GuiaCorrectiva[] = [
      { patronError: 'choque', mensaje: 'segunda', orden: 2 },
      { patronError: 'choque', mensaje: 'primera', orden: 1 },
      { patronError: 'vacio', mensaje: 'otra', orden: 0 },
    ]
    expect(seleccionar('choque', guias).mensaje).toBe('primera')
  })

  it('sin guías del servidor usa una guía de respaldo', () => {
    for (const p of PATRONES) expect(seleccionar(p, []).mensaje.length).toBeGreaterThan(20)
  })

  it('OE3: cada desafío tiene guía para el 100% de los patrones de error', () => {
    for (const d of NIVELES.flatMap((n) => n.desafios)) {
      const guias = guiasDe(d).map((g, i) => ({ ...g, orden: i + 1 }))
      for (const p of PATRONES) expect(guias.some((g) => g.patronError === p), `${d.id} sin guía «${p}»`).toBe(true)
    }
  })
})
