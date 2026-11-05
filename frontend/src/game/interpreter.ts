import type { Direccion, Laberinto, PatronError, Posicion, Programa, ResultadoEjecucion } from './types'

// Interpretador: ejecuta el programa del alumno localmente, en el navegador, sobre el laberinto.
// pasosMaximos evita ciclos infinitos producidos por bloques mal formados (RNF05).

export const PASOS_MAXIMOS = 200

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

export function posicionInicial(lab: Laberinto): Posicion {
  return { ...buscar(lab, 'I'), dir: lab.dirInicial }
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

export function ejecutar(programa: Programa, lab: Laberinto, pasosMaximos = PASOS_MAXIMOS): ResultadoEjecucion {
  const meta = buscar(lab, 'M')
  let pos = posicionInicial(lab)
  const traza: Posicion[] = [pos]
  let pasos = 0

  const resultado = (estado: ResultadoEjecucion['estado'], patronError: PatronError | null): ResultadoEjecucion => ({
    estado,
    traza,
    patronError,
    pasos: Math.min(pasos, pasosMaximos),
  })
  const enMeta = () => pos.fila === meta.fila && pos.col === meta.col
  const caminoAdelante = () => {
    const [df, dc] = DELTA[pos.dir]
    return esCamino(lab, pos.fila + df, pos.col + dc)
  }
  const contarPaso = () => {
    if (++pasos > pasosMaximos) throw new LimiteExcedido()
  }

  const correr = (bloque: Programa) => {
    for (const ins of bloque) {
      if (enMeta()) return
      contarPaso()
      switch (ins.tipo) {
        case 'avanzar': {
          if (!caminoAdelante()) throw new Choque()
          const [df, dc] = DELTA[pos.dir]
          pos = { ...pos, fila: pos.fila + df, col: pos.col + dc }
          traza.push(pos)
          break
        }
        case 'girar':
          pos = { ...pos, dir: girar(pos.dir, ins.sentido) }
          traza.push(pos)
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

  if (programa.length === 0) return resultado('ERROR', 'vacio')

  try {
    correr(programa)
  } catch (e) {
    if (e instanceof Choque) return resultado('ERROR', 'choque')
    if (e instanceof LimiteExcedido) return resultado('ERROR', 'limite_pasos')
    throw e
  }

  return enMeta() ? resultado('EXITO', null) : resultado('REINTENTO', 'incompleto')
}
