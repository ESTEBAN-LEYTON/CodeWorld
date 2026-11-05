import type { Instruccion, Laberinto, Nivel, Programa } from './types'

// Explicación de cada bloque con un ejemplo que se muestra armado y animado
// la primera vez que el bloque aparece en un desafío.

export interface AyudaBloque {
  nombre: string
  descripcion: string
  consejo: string
  ejemplo: Programa
  laberinto: Laberinto
}

const A: Instruccion = { tipo: 'avanzar' }
const DER: Instruccion = { tipo: 'girar', sentido: 'derecha' }

export const AYUDA_BLOQUES: Record<string, AyudaBloque> = {
  cw_avanzar: {
    nombre: 'avanzar',
    descripcion: 'Mueve al robot una casilla hacia donde apunta su flecha.',
    consejo: 'Pon un «avanzar» por cada casilla. Si hay una pared adelante, el robot choca.',
    ejemplo: [A, A],
    laberinto: { celdas: ['#####', '#I.M#', '#####'], dirInicial: 'E' },
  },
  cw_girar: {
    nombre: 'girar',
    descripcion: 'Gira al robot sin moverlo de su casilla: a la izquierda ↺ o a la derecha ↻.',
    consejo: 'Elige el lado en el menú del bloque. Gira justo antes de avanzar cuando el camino dobla.',
    ejemplo: [A, DER, A],
    laberinto: { celdas: ['####', '#I.#', '##M#', '####'], dirInicial: 'E' },
  },
  cw_repetir: {
    nombre: 'repetir … veces',
    descripcion: 'Repite los bloques de adentro las veces que indiques.',
    consejo: 'En vez de poner cuatro «avanzar», pon uno dentro de «repetir 4 veces». Cambia el número haciendo clic en él.',
    ejemplo: [{ tipo: 'repetir', veces: 4, cuerpo: [A] }],
    laberinto: { celdas: ['#######', '#I...M#', '#######'], dirInicial: 'E' },
  },
  cw_repetir_hasta_meta: {
    nombre: 'repetir hasta la meta',
    descripcion: 'Repite los bloques de adentro una y otra vez hasta que el robot llega a la estrella.',
    consejo: 'No necesitas contar: sirve cuando un mismo patrón se repite muchas veces.',
    ejemplo: [{ tipo: 'repetirHastaMeta', cuerpo: [A, DER, A, { tipo: 'girar', sentido: 'izquierda' }] }],
    laberinto: { celdas: ['#####', '#I.##', '##..#', '###M#', '#####'], dirInicial: 'E' },
  },
  cw_si_camino: {
    nombre: 'si hay camino adelante',
    descripcion: 'El robot mira adelante: si hay camino hace los bloques de arriba; si hay pared, hace los de «si no».',
    consejo: 'Dentro de «repetir hasta la meta», el robot decide solo en cada paso si avanza o gira.',
    ejemplo: [{ tipo: 'repetirHastaMeta', cuerpo: [{ tipo: 'siCaminoAdelante', entonces: [A], sino: [DER] }] }],
    laberinto: { celdas: ['#####', '#I..#', '###.#', '###M#', '#####'], dirInicial: 'E' },
  },
}

type BloqueJson = { type: string; fields?: Record<string, unknown>; inputs?: Record<string, { block: BloqueJson }>; next?: { block: BloqueJson } }

function bloqueJson(ins: Instruccion): BloqueJson {
  const entrada = (nombre: string, cuerpo: Programa) => (cuerpo.length ? { [nombre]: { block: cadenaJson(cuerpo)! } } : {})
  switch (ins.tipo) {
    case 'avanzar':
      return { type: 'cw_avanzar' }
    case 'girar':
      return { type: 'cw_girar', fields: { SENTIDO: ins.sentido } }
    case 'repetir':
      return { type: 'cw_repetir', fields: { VECES: ins.veces }, inputs: entrada('CUERPO', ins.cuerpo) }
    case 'repetirHastaMeta':
      return { type: 'cw_repetir_hasta_meta', inputs: entrada('CUERPO', ins.cuerpo) }
    case 'siCaminoAdelante':
      return { type: 'cw_si_camino', inputs: { ...entrada('ENTONCES', ins.entonces), ...entrada('SINO', ins.sino) } }
  }
}

function cadenaJson(programa: Programa): BloqueJson | undefined {
  const [primero, ...resto] = programa
  if (!primero) return undefined
  const b = bloqueJson(primero)
  const sig = cadenaJson(resto)
  return sig ? { ...b, next: { block: sig } } : b
}

/** Programa -> JSON de Blockly, colgado del bloque «Al ejecutar» (inverso de compilarWorkspace). */
export function programaAJson(programa: Programa, inicio: string): BloqueJson {
  const cuerpo = cadenaJson(programa)
  return cuerpo ? { type: inicio, next: { block: cuerpo } } : { type: inicio }
}

/** Para cada desafío, los bloques que aparecen por primera vez en el recorrido de niveles. */
export function bloquesNuevos(niveles: Nivel[]): Map<string, string[]> {
  const vistos = new Set<string>()
  const nuevos = new Map<string, string[]>()
  for (const d of [...niveles].sort((a, b) => a.orden - b.orden).flatMap((n) => [...n.desafios].sort((a, b) => a.orden - b.orden))) {
    nuevos.set(d.id, d.bloquesPermitidos.filter((b) => !vistos.has(b)))
    d.bloquesPermitidos.forEach((b) => vistos.add(b))
  }
  return nuevos
}
