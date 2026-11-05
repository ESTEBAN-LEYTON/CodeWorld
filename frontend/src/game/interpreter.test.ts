import { describe, expect, it } from 'vitest'
import { NIVELES } from '../../../backend/prisma/contenido'
import { ejecutar, PASOS_MAXIMOS } from './interpreter'
import type { Instruccion, Laberinto } from './types'

const A: Instruccion = { tipo: 'avanzar' }
const DER: Instruccion = { tipo: 'girar', sentido: 'derecha' }
const IZQ: Instruccion = { tipo: 'girar', sentido: 'izquierda' }

// El contenido es el mismo que el seed carga en PostgreSQL.
const DESAFIOS = NIVELES.flatMap((n) => n.desafios)
const lab = (id: string) => DESAFIOS.find((d) => d.id === id)!.laberinto as Laberinto

// Una solución de referencia por desafío: garantiza que todos se pueden resolver con sus bloques.
const SOLUCIONES: Record<string, Instruccion[]> = {
  'secuencias-1': [A, A],
  'secuencias-2': [A, A, DER, A, A],
  'ciclos-1': [{ tipo: 'repetir', veces: 6, cuerpo: [A] }],
  'ciclos-2': [{ tipo: 'repetirHastaMeta', cuerpo: [A, DER, A, IZQ] }],
  'condiciones-1': [{ tipo: 'repetirHastaMeta', cuerpo: [{ tipo: 'siCaminoAdelante', entonces: [A], sino: [DER] }] }],
  'condiciones-2': [{ tipo: 'repetirHastaMeta', cuerpo: [{ tipo: 'siCaminoAdelante', entonces: [A], sino: [IZQ] }] }],
}

const tiposUsados = (p: Instruccion[]): string[] =>
  p.flatMap((i) => {
    const propios = { avanzar: 'cw_avanzar', girar: 'cw_girar', repetir: 'cw_repetir', repetirHastaMeta: 'cw_repetir_hasta_meta', siCaminoAdelante: 'cw_si_camino' }[i.tipo]
    const hijos = 'cuerpo' in i ? i.cuerpo : 'entonces' in i ? [...i.entonces, ...i.sino] : []
    return [propios, ...tiposUsados(hijos)]
  })

describe('Interpretador.ejecutar', () => {
  it.each(DESAFIOS.map((d) => d.id))('el desafío %s tiene solución con sus bloques permitidos', (id) => {
    const d = DESAFIOS.find((x) => x.id === id)!
    expect(SOLUCIONES[id], `falta solución de referencia para ${id}`).toBeDefined()
    expect(d.bloquesPermitidos).toEqual(expect.arrayContaining(tiposUsados(SOLUCIONES[id])))
    const r = ejecutar(SOLUCIONES[id], lab(id))
    expect(r).toMatchObject({ estado: 'EXITO', patronError: null })
  })

  it('el límite de pasos del diseño es 200', () => {
    expect(PASOS_MAXIMOS).toBe(200)
  })

  it('programa vacío: ERROR con patrón «vacio»', () => {
    expect(ejecutar([], lab('secuencias-1'))).toMatchObject({ estado: 'ERROR', patronError: 'vacio' })
  })

  it('choque con pared: ERROR y conserva la traza hasta el choque', () => {
    const r = ejecutar([A, A, A, A], lab('secuencias-2'))
    expect(r).toMatchObject({ estado: 'ERROR', patronError: 'choque' })
    expect(r.traza.at(-1)).toMatchObject({ fila: 1, col: 3 })
  })

  it('programa que no llega a la meta: REINTENTO con patrón «incompleto»', () => {
    expect(ejecutar([A], lab('secuencias-1'))).toMatchObject({ estado: 'REINTENTO', patronError: 'incompleto' })
  })

  it('corta ciclos infinitos con el límite de pasos', () => {
    const r = ejecutar([{ tipo: 'repetirHastaMeta', cuerpo: [DER] }], lab('secuencias-1'))
    expect(r).toMatchObject({ estado: 'ERROR', patronError: 'limite_pasos', pasos: PASOS_MAXIMOS })
  })

  it('un ciclo vacío no cuelga el navegador', () => {
    expect(ejecutar([{ tipo: 'repetirHastaMeta', cuerpo: [] }], lab('secuencias-1')).patronError).toBe('limite_pasos')
  })

  it('se detiene al llegar a la meta aunque sobren bloques', () => {
    expect(ejecutar([A, A, A, A], lab('secuencias-1')).estado).toBe('EXITO')
  })

  it('evalúa muy por debajo de 300 ms (RNF01)', () => {
    const t0 = performance.now()
    for (let i = 0; i < 100; i++) ejecutar([{ tipo: 'repetirHastaMeta', cuerpo: [DER] }], lab('condiciones-1'))
    expect((performance.now() - t0) / 100).toBeLessThan(300)
  })
})
