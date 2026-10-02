import type { Desafio } from './types'

// Desafíos del nivel inicial. Datos locales mientras no exista la API de desafíos.

export const DESAFIOS: Desafio[] = [
  {
    id: 'inicial-1',
    titulo: 'Primeros pasos',
    enunciado: 'Lleva al robot hasta la estrella usando el bloque "avanzar".',
    laberinto: { celdas: ['#####', '#I.M#', '#####'], dirInicial: 'E' },
    bloquesPermitidos: ['cw_avanzar'],
    xpRecompensa: 10,
    bloquesOptimos: 2,
  },
  {
    id: 'inicial-2',
    titulo: 'La primera curva',
    enunciado: 'El camino dobla. Combina "avanzar" con "girar" para llegar a la estrella.',
    laberinto: { celdas: ['#####', '#I..#', '###.#', '###M#', '#####'], dirInicial: 'E' },
    bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
    xpRecompensa: 15,
    bloquesOptimos: 5,
  },
  {
    id: 'inicial-3',
    titulo: 'Repetir es más fácil',
    enunciado: 'Un pasillo largo. Usa "repetir" para no poner tantos bloques iguales.',
    laberinto: { celdas: ['#########', '#I.....M#', '#########'], dirInicial: 'E' },
    bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir'],
    xpRecompensa: 20,
    bloquesOptimos: 2,
  },
  {
    id: 'inicial-4',
    titulo: 'Escalera',
    enunciado: 'Encuentra el patrón que se repite y úsalo dentro de "repetir hasta la meta".',
    laberinto: {
      celdas: ['######', '#I.###', '##..##', '###..#', '####M#', '######'],
      dirInicial: 'E',
    },
    bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir', 'cw_repetir_hasta_meta'],
    xpRecompensa: 25,
    bloquesOptimos: 5,
  },
  {
    id: 'inicial-5',
    titulo: 'El robot decide',
    enunciado: 'Usa "si hay camino adelante" para que el robot decida solo cuándo girar.',
    laberinto: { celdas: ['######', '#I...#', '####.#', '#M...#', '######'], dirInicial: 'E' },
    bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
    xpRecompensa: 30,
    bloquesOptimos: 5,
  },
]
