import { describe, expect, it } from 'vitest'
import * as Blockly from 'blockly/core'
import { NIVELES } from '../../../backend/prisma/contenido'
import { AYUDA_BLOQUES, bloquesNuevos, programaAJson } from './ayudaBloques'
import { BLOQUE_INICIO, compilarWorkspace } from './blocks'
import { ejecutar } from './interpreter'
import type { Nivel } from './types'

const niveles = NIVELES.map((n, i) => ({
  ...n,
  orden: i + 1,
  desafios: n.desafios.map((d, j) => ({ ...d, orden: j + 1, bloquesOptimos: d.bloquesOptimos ?? null, guias: [] })),
})) as Nivel[]

describe('ayuda de bloques', () => {
  it('todo bloque usado en los desafíos tiene explicación', () => {
    for (const d of niveles.flatMap((n) => n.desafios)) {
      for (const b of d.bloquesPermitidos) expect(AYUDA_BLOQUES[b], `falta ayuda de ${b}`).toBeDefined()
    }
  })

  it.each(Object.keys(AYUDA_BLOQUES))('el ejemplo de %s llega a la meta y usa ese bloque', (tipo) => {
    const a = AYUDA_BLOQUES[tipo]
    expect(ejecutar(a.ejemplo, a.laberinto).estado).toBe('EXITO')
    expect(JSON.stringify(programaAJson(a.ejemplo, BLOQUE_INICIO))).toContain(`"${tipo}"`)
  })

  it.each(Object.keys(AYUDA_BLOQUES))('el ejemplo de %s se convierte en bloques y vuelve igual', (tipo) => {
    const ws = new Blockly.Workspace()
    Blockly.serialization.blocks.append(programaAJson(AYUDA_BLOQUES[tipo].ejemplo, BLOQUE_INICIO), ws)
    expect(compilarWorkspace(ws)).toEqual(AYUDA_BLOQUES[tipo].ejemplo)
    ws.dispose()
  })

  it('cada bloque es «nuevo» solo en el primer desafío donde aparece', () => {
    const nuevos = bloquesNuevos(niveles)
    expect(nuevos.get('secuencias-1')).toEqual(['cw_avanzar'])
    expect(nuevos.get('secuencias-2')).toEqual(['cw_girar'])
    expect(nuevos.get('ciclos-1')).toEqual(['cw_repetir'])
    expect(nuevos.get('ciclos-2')).toEqual(['cw_repetir_hasta_meta'])
    expect(nuevos.get('condiciones-1')).toEqual(['cw_si_camino'])
    expect(nuevos.get('condiciones-2')).toEqual([])
  })
})
