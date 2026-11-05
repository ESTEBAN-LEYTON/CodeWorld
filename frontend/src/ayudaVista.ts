import { useCallback, useState } from 'react'
import { guardar, leer } from './almacen'

// Recuerda, por usuario y dispositivo, qué tutoriales y bloques nuevos ya se mostraron.

export interface AyudaVista {
  menu: boolean
  juego: boolean
  tutor: boolean
  bloques: string[]
}

const VACIA: AyudaVista = { menu: false, juego: false, tutor: false, bloques: [] }

export function useAyudaVista(usuario: string) {
  const clave = `codeworld.ayuda.${usuario}`
  const [vista, setVista] = useState<AyudaVista>(() => ({ ...VACIA, ...leer<Partial<AyudaVista>>(clave, {}) }))
  const marcar = useCallback(
    (cambio: Partial<AyudaVista>) =>
      setVista((v) => {
        const nueva = { ...v, ...cambio }
        guardar(clave, nueva)
        return nueva
      }),
    [clave],
  )
  return [vista, marcar] as const
}
