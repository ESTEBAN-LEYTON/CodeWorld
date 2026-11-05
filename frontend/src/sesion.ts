import { borrar, guardar, leer } from './almacen'

export type Sesion =
  | { rol: 'alumno'; token: string; alumnoId: string; username: string }
  | { rol: 'tutor'; token: string; username: string }

const CLAVE = 'codeworld.sesion'

export const leerSesion = () => leer<Sesion | null>(CLAVE, null)
export const guardarSesion = (s: Sesion) => guardar(CLAVE, s)
export const cerrarSesion = () => borrar(CLAVE)
