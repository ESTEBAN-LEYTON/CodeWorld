// Contenido inicial de CodeWorld: niveles, desafíos y guías correctivas (OE3).
// Es la única fuente de los desafíos: el seed lo carga en PostgreSQL y el frontend
// verifica en sus pruebas que cada desafío se puede resolver con el Interpretador.

export type PatronError = 'vacio' | 'choque' | 'incompleto' | 'limite_pasos'

export interface GuiaSemilla {
  patronError: PatronError
  mensaje: string
}

export interface DesafioSemilla {
  id: string
  titulo: string
  enunciado: string
  laberinto: { celdas: string[]; dirInicial: 'N' | 'E' | 'S' | 'O' }
  bloquesPermitidos: string[]
  bloquesOptimos?: number
  xpRecompensa: number
  /** Guías propias del desafío; las que falten se completan con las genéricas. */
  guias?: Partial<Record<PatronError, string>>
}

export interface NivelSemilla {
  id: string
  titulo: string
  descripcion: string
  desafios: DesafioSemilla[]
}

const GENERICAS: Record<PatronError, string> = {
  vacio: 'Tu programa está vacío. Arrastra bloques desde la izquierda y únelos debajo de «Al ejecutar».',
  choque:
    'Tu robot chocó con una pared. Mira hacia dónde apunta la flecha justo antes del choque: ¿necesitaba girar antes de avanzar?',
  incompleto:
    'Tu robot se detuvo antes de llegar a la meta. Cuenta cuántas casillas le faltan y agrega los pasos que faltan.',
  limite_pasos:
    'Tu programa se repite sin terminar nunca. Revisa los bloques «repetir»: ¿el robot realmente se acerca a la meta en cada vuelta?',
}

export function guiasDe(d: DesafioSemilla): GuiaSemilla[] {
  return (Object.keys(GENERICAS) as PatronError[]).map((patronError) => ({
    patronError,
    mensaje: d.guias?.[patronError] ?? GENERICAS[patronError],
  }))
}

export const NIVELES: NivelSemilla[] = [
  {
    id: 'secuencias',
    titulo: 'Secuencias',
    descripcion: 'Da instrucciones en orden, una tras otra.',
    desafios: [
      {
        id: 'secuencias-1',
        titulo: 'Primeros pasos',
        enunciado: 'Lleva al robot hasta la estrella usando el bloque «avanzar».',
        laberinto: { celdas: ['#####', '#I.M#', '#####'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar'],
        bloquesOptimos: 2,
        xpRecompensa: 10,
        guias: {
          incompleto: 'Casi. Cuenta las casillas entre el robot y la estrella: necesitas un «avanzar» por cada una.',
        },
      },
      {
        id: 'secuencias-2',
        titulo: 'La primera curva',
        enunciado: 'El camino dobla. Combina «avanzar» con «girar» para llegar a la estrella.',
        laberinto: { celdas: ['#####', '#I..#', '###.#', '###M#', '#####'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
        bloquesOptimos: 5,
        xpRecompensa: 15,
        guias: {
          choque:
            'El robot siguió derecho y chocó. Cuando llega a la esquina, ¿hacia qué lado tiene que mirar para seguir el camino?',
        },
      },
    ],
  },
  {
    id: 'ciclos',
    titulo: 'Ciclos',
    descripcion: 'Repite instrucciones sin copiar los mismos bloques una y otra vez.',
    desafios: [
      {
        id: 'ciclos-1',
        titulo: 'Repetir es más fácil',
        enunciado: 'Un pasillo largo. Usa «repetir» para no poner tantos bloques iguales.',
        laberinto: { celdas: ['#########', '#I.....M#', '#########'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir'],
        bloquesOptimos: 2,
        xpRecompensa: 20,
        guias: {
          incompleto: 'Te faltaron pasos. ¿Cuántas veces tiene que repetirse «avanzar» para cruzar todo el pasillo?',
          choque: 'El robot avanzó más de la cuenta o en la dirección equivocada. Revisa el número dentro de «repetir».',
        },
      },
      {
        id: 'ciclos-2',
        titulo: 'Escalera',
        enunciado: 'Encuentra el patrón que se repite y úsalo dentro de «repetir hasta la meta».',
        laberinto: {
          celdas: ['######', '#I.###', '##..##', '###..#', '####M#', '######'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir', 'cw_repetir_hasta_meta'],
        bloquesOptimos: 5,
        xpRecompensa: 25,
        guias: {
          choque:
            'Cada escalón es igual: avanzar, girar, avanzar, girar. Después de bajar un escalón, ¿hacia dónde mira el robot?',
          limite_pasos:
            'El robot da vueltas sin llegar. Dentro de «repetir hasta la meta» tiene que haber al menos un «avanzar» que lo acerque.',
        },
      },
    ],
  },
  {
    id: 'condiciones',
    titulo: 'Condiciones',
    descripcion: 'Haz que el robot decida solo qué hacer según lo que tiene adelante.',
    desafios: [
      {
        id: 'condiciones-1',
        titulo: 'El robot decide',
        enunciado: 'Usa «si hay camino adelante» para que el robot decida solo cuándo girar.',
        laberinto: { celdas: ['######', '#I...#', '####.#', '#M...#', '######'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 5,
        xpRecompensa: 30,
        guias: {
          choque: 'El robot avanzó sin mirar. Pon «avanzar» dentro del «si hay camino adelante» para que solo avance cuando puede.',
          limite_pasos:
            'El robot gira en el mismo lugar. Cuando hay una pared adelante, ¿hacia qué lado sigue el camino en este laberinto?',
        },
      },
      {
        id: 'condiciones-2',
        titulo: 'Subir por la izquierda',
        enunciado: 'Ahora el camino dobla hacia el otro lado. Ajusta tu programa para que el robot decida bien.',
        laberinto: { celdas: ['#######', '#M....#', '#####.#', '#I....#', '#######'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 5,
        xpRecompensa: 35,
        guias: {
          limite_pasos:
            'El robot gira pero vuelve a quedar frente a una pared. En este laberinto el camino sigue hacia la izquierda, no hacia la derecha.',
        },
      },
    ],
  },
]
