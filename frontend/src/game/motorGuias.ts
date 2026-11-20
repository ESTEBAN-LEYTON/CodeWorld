import type { GuiaCorrectiva, PatronError } from './types'

// MotorGuias (OE3): elige la guía correctiva que corresponde al patrón de error.
// Corre en el navegador, así que la retroalimentación no depende de la red (RNF01).

const RESPALDO: Record<PatronError, string> = {
  vacio: 'Tu programa está vacío. Arrastra bloques desde la zona gris y únelos debajo de «Al ejecutar».',
  choque: 'Tu robot chocó con una pared. ¿Necesitaba girar antes de avanzar?',
  incompleto: 'Tu robot se detuvo antes de llegar a la meta. ¿Cuántas casillas le faltan?',
  limite_pasos: 'Tu programa se repite sin terminar. ¿El robot se acerca a la meta en cada vuelta?',
}

export function seleccionar(patronError: PatronError, guias: GuiaCorrectiva[]): GuiaCorrectiva {
  const propia = guias.filter((g) => g.patronError === patronError).sort((a, b) => a.orden - b.orden)[0]
  return propia ?? { patronError, mensaje: RESPALDO[patronError], orden: 0 }
}
