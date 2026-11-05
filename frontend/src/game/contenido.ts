import { llamar } from '../api'
import { guardar, leer } from '../almacen'
import type { Nivel } from './types'

// Niveles y desafíos de ServicioContenido. Se guardan en caché para jugar sin conexión.

const CLAVE = 'codeworld.contenido'

export interface Contenido {
  niveles: Nivel[]
  origen: 'servidor' | 'cache'
}

export async function cargarNiveles(): Promise<Contenido> {
  try {
    const niveles = await llamar<Nivel[]>('/niveles')
    guardar(CLAVE, niveles)
    return { niveles, origen: 'servidor' }
  } catch (e) {
    const cache = leer<Nivel[] | null>(CLAVE, null)
    if (cache) return { niveles: cache, origen: 'cache' }
    throw e
  }
}
