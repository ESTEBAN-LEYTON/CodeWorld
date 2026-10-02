// Tipos del dominio del juego: laberinto, programa y resultado de ejecución.

export type Direccion = 'N' | 'E' | 'S' | 'O'

export interface Posicion {
  fila: number
  col: number
  dir: Direccion
}

/** Celdas: '#' pared, '.' camino, 'I' inicio, 'M' meta. */
export interface Laberinto {
  celdas: string[]
  dirInicial: Direccion
}

/** Programa intermedio construido a partir de los bloques (sin eval de JS). */
export type Instruccion =
  | { tipo: 'avanzar' }
  | { tipo: 'girar'; sentido: 'izquierda' | 'derecha' }
  | { tipo: 'repetir'; veces: number; cuerpo: Instruccion[] }
  | { tipo: 'repetirHastaMeta'; cuerpo: Instruccion[] }
  | { tipo: 'siCaminoAdelante'; entonces: Instruccion[]; sino: Instruccion[] }

export type Estado = 'exito' | 'choque' | 'incompleto' | 'limite_pasos' | 'vacio'

/** Value object del diagrama de clases (ResultadoEjecucion). */
export interface ResultadoEjecucion {
  trace: Posicion[]
  estado: Estado
  mensaje: string
}

export interface Desafio {
  id: string
  titulo: string
  enunciado: string
  laberinto: Laberinto
  bloquesPermitidos: string[]
  xpRecompensa: number
  /** Máximo de bloques sugerido; superarlo no es error, solo una pista. */
  bloquesOptimos?: number
}
