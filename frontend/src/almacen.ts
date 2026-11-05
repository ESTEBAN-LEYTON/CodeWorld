// Acceso a localStorage tolerante a fallos (modo privado, almacenamiento bloqueado o lleno).

export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

function almacenNavegador(): Almacen | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function leer<T>(clave: string, defecto: T, almacen = almacenNavegador()): T {
  try {
    const v = almacen?.getItem(clave)
    return v ? (JSON.parse(v) as T) : defecto
  } catch {
    return defecto
  }
}

export function guardar(clave: string, valor: unknown, almacen = almacenNavegador()) {
  try {
    almacen?.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento: los datos viven solo mientras la pestaña esté abierta.
  }
}

export function borrar(clave: string, almacen = almacenNavegador()) {
  try {
    almacen?.removeItem(clave)
  } catch {
    // Nada que borrar.
  }
}
