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
  vacio: 'Tu programa está vacío. Arrastra bloques desde la zona gris y únelos debajo de «Al ejecutar».',
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
      {
        id: 'secuencias-3',
        titulo: 'Curva hacia arriba',
        enunciado: 'Esta vez el camino sube. ¿Hacia qué lado tiene que girar el robot?',
        laberinto: { celdas: ['######', '####M#', '####.#', '#I...#', '######'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
        bloquesOptimos: 6,
        xpRecompensa: 15,
        guias: {
          choque:
            'El robot giró hacia el lado equivocado o muy pronto. Si mira a la derecha (➤) y tiene que subir, ¿gira a la izquierda o a la derecha?',
          incompleto: 'Vas bien. Después de girar, cuenta las casillas que faltan hasta la estrella.',
        },
      },
      {
        id: 'secuencias-4',
        titulo: 'Zigzag',
        enunciado: 'El camino baja como una escalera. Fíjate en cada esquina: a veces se gira a la derecha y a veces a la izquierda.',
        laberinto: {
          celdas: ['#######', '#I.####', '##.####', '##...##', '####.##', '####.M#', '#######'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
        bloquesOptimos: 12,
        xpRecompensa: 20,
        guias: {
          choque:
            'Choque en una esquina. Antes de cada giro, imagina que eres el robot: ¿el camino sigue a tu derecha o a tu izquierda?',
          incompleto: 'El robot se detuvo a mitad de camino. Revisa el último tramo: ¿le faltan pasos o un giro?',
        },
      },
      {
        id: 'secuencias-5',
        titulo: 'Media vuelta',
        enunciado: 'El robot empieza mirando hacia la pared. Hazlo darse vuelta antes de avanzar.',
        laberinto: { celdas: ['#######', '#I...M#', '#######'], dirInicial: 'O' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
        bloquesOptimos: 6,
        xpRecompensa: 20,
        guias: {
          choque:
            'El robot chocó apenas partió: mira hacia la izquierda, contra la pared. ¿Cuántos giros necesita para mirar hacia la estrella?',
          incompleto: 'Ya se dio vuelta. Ahora cuenta las casillas hasta la estrella.',
        },
      },
      {
        id: 'secuencias-6',
        titulo: 'El rodeo',
        enunciado: 'Una pared tapa el camino directo. Sube, cruza por arriba y baja hasta la estrella.',
        laberinto: { celdas: ['#######', '#.....#', '#.###.#', '#I###M#', '#######'], dirInicial: 'N' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar'],
        bloquesOptimos: 10,
        xpRecompensa: 25,
        guias: {
          choque:
            'Esta vez el robot parte mirando hacia arriba (▲). En cada esquina, imagina que eres el robot: ¿el camino sigue a tu derecha o a tu izquierda?',
          incompleto: 'El robot se detuvo antes. Revisa el último tramo: después de la segunda esquina tiene que bajar 2 casillas.',
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
      {
        id: 'ciclos-3',
        titulo: 'Un repetir dentro de otro',
        enunciado: 'Cada tramo es igual: 3 pasos y un giro. Pon un «repetir» dentro de otro «repetir».',
        laberinto: { celdas: ['######', '#I...#', '####.#', '####.#', '#M...#', '######'], dirInicial: 'E' },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir'],
        bloquesOptimos: 4,
        xpRecompensa: 25,
        guias: {
          choque:
            'El robot chocó al final de un tramo. Después de los 3 pasos tiene que girar: ¿el giro quedó dentro del «repetir» de afuera?',
          incompleto:
            'Faltó un tramo. El «repetir» de afuera indica cuántos tramos recorre el robot: ¿cuántos tramos tiene el camino?',
        },
      },
      {
        id: 'ciclos-4',
        titulo: 'La serpiente',
        enunciado: 'Tres pasillos largos unidos por curvas. Usa «repetir» para cada pasillo y ahorra bloques.',
        laberinto: {
          celdas: ['#########', '#I......#', '#######.#', '#.......#', '#.#######', '#......M#', '#########'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir'],
        bloquesOptimos: 14,
        xpRecompensa: 30,
        guias: {
          choque:
            'Cada pasillo tiene 6 casillas. Si el robot chocó, revisa el número de «repetir» o el giro: la primera curva es a la derecha y la segunda, a la izquierda.',
          incompleto: 'El robot no llegó al último pasillo. Cuenta las curvas: ¿hay un giro y dos pasos por cada una?',
        },
      },
      {
        id: 'ciclos-5',
        titulo: 'Escalones largos',
        enunciado: 'Cada escalón tiene 2 pasos de largo y 1 de alto. Descubre el patrón y repítelo hasta la meta.',
        laberinto: {
          celdas: ['#########', '#I..#####', '###...###', '#####...#', '#######M#', '#########'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir', 'cw_repetir_hasta_meta'],
        bloquesOptimos: 6,
        xpRecompensa: 30,
        guias: {
          choque:
            'El patrón de cada escalón es: avanzar 2 veces, girar a la derecha, avanzar 1 vez y girar a la izquierda. ¿Cuál de esos pasos falta o sobra?',
          limite_pasos:
            'El robot repite sin llegar. Revisa que dentro del «repetir» quede un escalón completo, con sus 2 giros.',
          incompleto: 'Faltan escalones. Usa «repetir hasta la meta» y no tendrás que contarlos.',
        },
      },
      {
        id: 'ciclos-6',
        titulo: 'La vuelta completa',
        enunciado:
          'El camino da la vuelta a un cuadrado. Con solo 4 bloques se puede: un «repetir» dentro de otro. El robot se detiene solo al llegar a la estrella.',
        laberinto: {
          celdas: ['#######', '#I....#', '#####.#', '#M###.#', '#.###.#', '#.....#', '#######'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir'],
        bloquesOptimos: 4,
        xpRecompensa: 35,
        guias: {
          choque:
            'Cada lado del cuadrado tiene 4 pasos y después viene un giro a la derecha. Revisa el número del «repetir» de adentro.',
          incompleto:
            'El robot no completó la vuelta. El «repetir» de afuera es la cantidad de lados: ¿cuántos lados recorre hasta la estrella?',
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
      {
        id: 'condiciones-3',
        titulo: 'El caracol',
        enunciado: 'Un laberinto en espiral. ¿Sirve el mismo programa del desafío «El robot decide»? Pruébalo.',
        laberinto: {
          celdas: ['#########', '#I......#', '#######.#', '#.....#.#', '#.###M#.#', '#.#####.#', '#.......#', '#########'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 4,
        xpRecompensa: 40,
        guias: {
          choque:
            'Con tantas curvas es difícil contar. Deja que el robot decida: «si hay camino adelante» avanza y, si no, gira.',
          limite_pasos:
            'El robot gira sin avanzar. En este caracol todas las curvas son hacia la derecha: ¿hacia dónde gira tu robot cuando hay pared?',
          incompleto: 'El robot se detuvo. Pon tu decisión dentro de «repetir hasta la meta» para que la tome en cada casilla.',
        },
      },
      {
        id: 'condiciones-4',
        titulo: 'Curvas para ambos lados',
        enunciado:
          'El camino dobla a la derecha y a la izquierda. Si al girar a la derecha todavía hay pared, el robot tiene que darse vuelta hacia el otro lado.',
        laberinto: {
          celdas: ['########', '#I.#####', '##.#M..#', '##.###.#', '##.....#', '########'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 7,
        xpRecompensa: 50,
        guias: {
          choque: 'El robot avanzó sin mirar. Cada «avanzar» tiene que estar dentro de «si hay camino adelante».',
          limite_pasos:
            'El robot da vueltas en una esquina. Pista: dentro del «si no», gira a la derecha y pregunta otra vez con un segundo «si hay camino adelante». Si tampoco hay camino, gira dos veces más.',
          incompleto: 'El robot se detuvo. Pon tu decisión dentro de «repetir hasta la meta» para que la tome en cada casilla.',
        },
      },
      {
        id: 'condiciones-5',
        titulo: 'El gancho',
        enunciado: 'Curvas a la derecha y a la izquierda. ¿Sirve tu programa de «Curvas para ambos lados»? Pruébalo.',
        laberinto: {
          celdas: ['#########', '#I..#####', '###.#M..#', '###.###.#', '###.....#', '#########'],
          dirInicial: 'E',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 7,
        xpRecompensa: 55,
        guias: {
          choque: 'El robot avanzó sin mirar. Cada «avanzar» tiene que estar dentro de «si hay camino adelante».',
          limite_pasos:
            'El robot da vueltas en una esquina. Si no hay camino adelante, gira a la derecha y pregunta otra vez; si tampoco hay, gira dos veces más.',
          incompleto: 'El robot se detuvo. Pon tu decisión dentro de «repetir hasta la meta» para que la tome en cada casilla.',
        },
      },
      {
        id: 'condiciones-6',
        titulo: 'El gran laberinto',
        enunciado:
          'Reto final: el robot parte mirando una pared y el camino tiene curvas para ambos lados. Un buen programa que decide solo lo resuelve todo.',
        laberinto: {
          celdas: ['#########', '#I#.....#', '#.#.###.#', '#...#M#.#', '#####.#.#', '#####...#', '#########'],
          dirInicial: 'N',
        },
        bloquesPermitidos: ['cw_avanzar', 'cw_girar', 'cw_repetir_hasta_meta', 'cw_si_camino'],
        bloquesOptimos: 7,
        xpRecompensa: 60,
        guias: {
          choque: 'El robot avanzó contra una pared. Que solo avance cuando «si hay camino adelante» se cumple.',
          limite_pasos:
            'El robot gira sin salir de un lugar. Recuerda: si no hay camino, prueba a la derecha y, si tampoco, date vuelta hacia la izquierda con 2 giros más.',
          incompleto: 'El robot se detuvo. Pon tu decisión dentro de «repetir hasta la meta» para que la tome en cada casilla.',
        },
      },
    ],
  },
]
