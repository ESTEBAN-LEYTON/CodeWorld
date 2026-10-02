import * as Blockly from 'blockly/core'
import type { Instruccion } from './types'

// Bloques propios de CodeWorld y traducción del workspace a un programa (Instruccion[]).
// No se genera ni se evalúa JavaScript: el intérprete recorre esta estructura.

export const BLOQUE_INICIO = 'cw_al_ejecutar'

const COLOR_MOVIMIENTO = 160
const COLOR_CONTROL = 210

Blockly.common.defineBlocksWithJsonArray([
  {
    type: BLOQUE_INICIO,
    message0: '▶ Al ejecutar',
    nextStatement: null,
    colour: 45,
    deletable: false,
  },
  {
    type: 'cw_avanzar',
    message0: 'avanzar',
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_MOVIMIENTO,
  },
  {
    type: 'cw_girar',
    message0: 'girar a la %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SENTIDO',
        options: [
          ['izquierda ↺', 'izquierda'],
          ['derecha ↻', 'derecha'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_MOVIMIENTO,
  },
  {
    type: 'cw_repetir',
    message0: 'repetir %1 veces %2 %3',
    args0: [
      { type: 'field_number', name: 'VECES', value: 3, min: 0, max: 20, precision: 1 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'CUERPO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_CONTROL,
  },
  {
    type: 'cw_repetir_hasta_meta',
    message0: 'repetir hasta la meta ★ %1 %2',
    args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'CUERPO' }],
    previousStatement: null,
    colour: COLOR_CONTROL,
  },
  {
    type: 'cw_si_camino',
    message0: 'si hay camino adelante %1 %2 si no %3',
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'ENTONCES' },
      { type: 'input_statement', name: 'SINO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_CONTROL,
  },
])

export function toolboxPara(bloquesPermitidos: string[]): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'flyoutToolbox',
    contents: bloquesPermitidos.map((type) => ({ kind: 'block', type })),
  }
}

function compilarCadena(bloque: Blockly.Block | null): Instruccion[] {
  const programa: Instruccion[] = []
  for (let b = bloque; b; b = b.getNextBlock()) {
    if (b.isEnabled() === false) continue
    switch (b.type) {
      case 'cw_avanzar':
        programa.push({ tipo: 'avanzar' })
        break
      case 'cw_girar':
        programa.push({ tipo: 'girar', sentido: b.getFieldValue('SENTIDO') })
        break
      case 'cw_repetir':
        programa.push({
          tipo: 'repetir',
          veces: Number(b.getFieldValue('VECES')),
          cuerpo: compilarCadena(b.getInputTargetBlock('CUERPO')),
        })
        break
      case 'cw_repetir_hasta_meta':
        programa.push({ tipo: 'repetirHastaMeta', cuerpo: compilarCadena(b.getInputTargetBlock('CUERPO')) })
        break
      case 'cw_si_camino':
        programa.push({
          tipo: 'siCaminoAdelante',
          entonces: compilarCadena(b.getInputTargetBlock('ENTONCES')),
          sino: compilarCadena(b.getInputTargetBlock('SINO')),
        })
        break
    }
  }
  return programa
}

/** Solo cuentan los bloques conectados bajo "Al ejecutar"; los sueltos se ignoran. */
export function compilarWorkspace(ws: Blockly.Workspace): Instruccion[] {
  const inicio = ws.getBlocksByType(BLOQUE_INICIO, false)[0]
  return inicio ? compilarCadena(inicio.getNextBlock()) : []
}
