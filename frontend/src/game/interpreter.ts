import type { Direccion, Instruccion, Laberinto, Posicion, ResultadoEjecucion } from './types'
import { guiaPara } from './feedback'

// BlocklyInterpreter: ejecuta el programa del alumno localmente sobre el laberinto.
// El límite de pasos evita ciclos infinitos producidos por bloques mal formados.

export const LIMITE_DE_PASOS = 500

const ORDEN: Direccion[] = ['N', 'E', 'S', 'O']
const DELTA: Record<Direccion, [number, number]> = {
  N: [-1, 0],
  E: [0, 1],
  S: [1, 0],
  O: [0, -1],
}

export function buscar(lab: Laberinto, simbolo: string): { fila: number; col: number } {
  for (let fila = 0; fila < lab.celdas.length; fila++) {
    const col = lab.celdas[fila].indexOf(simbolo)
    if (col >= 0) return { fila, col }
  }
  throw new Error(`El laberinto no contiene '${simbolo}'`)
}

function esCamino(lab: Laberinto, fila: number, col: number): boolean {
  const c = lab.celdas[fila]?.[col]
  return c !== undefined && c !== '#'
}

function girar(dir: Direccion, sentido: 'izquierda' | 'derecha'): Direccion {
  const i = ORDEN.indexOf(dir)
  return ORDEN[(i + (sentido === 'derecha' ? 1 : 3)) % 4]
}

class Choque extends Error {}
class LimiteExcedido extends Error {}

export function ejecutar(programa: Instruccion[], lab: Laberinto, limite = LIMITE_DE_PASOS): ResultadoEjecucion {
  const inicio = buscar(lab, 'I')
  const meta = buscar(lab, 'M')
  let pos: Posicion = { ...inicio, dir: lab.dirInicial }
  const trace: Posicion[] = [pos]
  let pasos = 0

  const enMeta = () => pos.fila === meta.fila && pos.col === meta.col
  const caminoAdelante = () => {
    const [df, dc] = DELTA[pos.dir]
    return esCamino(lab, pos.fila + df, pos.col + dc)
  }
  const contarPaso = () => {
    if (++pasos > limite) throw new LimiteExcedido()
  }

  const correr = (bloque: Instruccion[]) => {
    for (const ins of bloque) {
      if (enMeta()) return
      contarPaso()
      switch (ins.tipo) {
        case 'avanzar': {
          if (!caminoAdelante()) throw new Choque()
          const [df, dc] = DELTA[pos.dir]
          pos = { ...pos, fila: pos.fila + df, col: pos.col + dc }
          trace.push(pos)
          break
        }
        case 'girar':
          pos = { ...pos, dir: girar(pos.dir, ins.sentido) }
          trace.push(pos)
          break
        case 'repetir':
          for (let i = 0; i < ins.veces && !enMeta(); i++) correr(ins.cuerpo)
          break
        case 'repetirHastaMeta':
          while (!enMeta()) {
            contarPaso()
            correr(ins.cuerpo)
          }
          break
        case 'siCaminoAdelante':
          correr(caminoAdelante() ? ins.entonces : ins.sino)
          break
      }
    }
  }

  if (programa.length === 0) return { trace, estado: 'vacio', mensaje: guiaPara('vacio') }

  try {
    correr(programa)
  } catch (e) {
    if (e instanceof Choque) return { trace, estado: 'choque', mensaje: guiaPara('choque') }
    if (e instanceof LimiteExcedido) return { trace, estado: 'limite_pasos', mensaje: guiaPara('limite_pasos') }
    throw e
  }

  return enMeta()
    ? { trace, estado: 'exito', mensaje: guiaPara('exito') }
    : { trace, estado: 'incompleto', mensaje: guiaPara('incompleto') }
}
