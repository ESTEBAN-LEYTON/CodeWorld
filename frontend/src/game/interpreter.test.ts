import { describe, expect, it } from 'vitest'
import { ejecutar } from './interpreter'
import { DESAFIOS } from './levels'
import type { Instruccion } from './types'

const A: Instruccion = { tipo: 'avanzar' }
const DER: Instruccion = { tipo: 'girar', sentido: 'derecha' }
const IZQ: Instruccion = { tipo: 'girar', sentido: 'izquierda' }

const lab = (id: string) => DESAFIOS.find((d) => d.id === id)!.laberinto

// Una solución de referencia por desafío: garantiza que todos son resolubles.
const SOLUCIONES: Record<string, Instruccion[]> = {
  'inicial-1': [A, A],
  'inicial-2': [A, A, DER, A, A],
  'inicial-3': [{ tipo: 'repetir', veces: 6, cuerpo: [A] }],
  'inicial-4': [{ tipo: 'repetirHastaMeta', cuerpo: [A, DER, A, IZQ] }],
  'inicial-5': [{ tipo: 'repetirHastaMeta', cuerpo: [{ tipo: 'siCaminoAdelante', entonces: [A], sino: [DER] }] }],
}

describe('BlocklyInterpreter.ejecutar', () => {
  it.each(DESAFIOS.map((d) => d.id))('el desafío %s tiene solución', (id) => {
    expect(ejecutar(SOLUCIONES[id], lab(id)).estado).toBe('exito')
  })

  it('programa vacío', () => {
    expect(ejecutar([], lab('inicial-1')).estado).toBe('vacio')
  })

  it('detecta choque con pared y conserva la traza hasta el choque', () => {
    const r = ejecutar([A, A, A, A], lab('inicial-2'))
    expect(r.estado).toBe('choque')
    expect(r.trace.at(-1)).toMatchObject({ fila: 1, col: 3 })
  })

  it('detecta programa incompleto', () => {
    expect(ejecutar([A], lab('inicial-1')).estado).toBe('incompleto')
  })

  it('corta ciclos infinitos con el límite de pasos', () => {
    const r = ejecutar([{ tipo: 'repetirHastaMeta', cuerpo: [DER] }], lab('inicial-1'))
    expect(r.estado).toBe('limite_pasos')
  })

  it('un ciclo vacío no cuelga el navegador', () => {
    expect(ejecutar([{ tipo: 'repetirHastaMeta', cuerpo: [] }], lab('inicial-1')).estado).toBe('limite_pasos')
  })

  it('se detiene al llegar a la meta aunque sobren bloques', () => {
    expect(ejecutar([A, A, A, A], lab('inicial-1')).estado).toBe('exito')
  })

  it('cada error entrega una guía correctiva no vacía', () => {
    for (const p of [[], [A], [A, A, A, A]] as Instruccion[][]) {
      expect(ejecutar(p, lab('inicial-2')).mensaje.length).toBeGreaterThan(20)
    }
  })
})
