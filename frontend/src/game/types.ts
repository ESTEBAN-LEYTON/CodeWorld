// Tipos del dominio (Figura 7 del informe): laberinto, programa, desafío y resultado de ejecución.

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

export type Programa = Instruccion[]

/** EXITO: llegó a la meta. REINTENTO: el programa corrió bien pero no llegó. ERROR: falló al ejecutarse. */
export type EstadoResultado = 'EXITO' | 'REINTENTO' | 'ERROR'

/** Coincide con GUIA_CORRECTIVA.patron_error en la base de datos. */
export type PatronError = 'vacio' | 'choque' | 'incompleto' | 'limite_pasos'

/** Única representación del resultado de una ejecución (value object). */
export interface ResultadoEjecucion {
  estado: EstadoResultado
  traza: Posicion[]
  patronError: PatronError | null
  pasos: number
}

export interface GuiaCorrectiva {
  patronError: PatronError
  mensaje: string
  orden: number
}

export interface Desafio {
  id: string
  orden: number
  titulo: string
  enunciado: string
  laberinto: Laberinto
  bloquesPermitidos: string[]
  /** Máximo de bloques sugerido; superarlo no es error, solo una pista. */
  bloquesOptimos: number | null
  xpRecompensa: number
  guias: GuiaCorrectiva[]
}

export interface Nivel {
  id: string
  orden: number
  titulo: string
  descripcion: string
  desafios: Desafio[]
}

/** Registro de PROGRESO de un desafío (por desafío, no por nivel). */
export interface Progreso {
  desafioId: string
  completadoEn: string
  intentos: number
}
