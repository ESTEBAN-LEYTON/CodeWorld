import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

// Tokens de sesión sin estado (JWT). El backend no guarda sesiones en memoria.

export type Rol = 'tutor' | 'alumno'

export interface Sesion {
  sub: string
  rol: Rol
}

/** Token intermedio del login del tutor: prueba que la contraseña fue correcta y espera el 2FA. */
interface Desafio2fa {
  sub: string
  rol: 'tutor_2fa'
  codigo: string
}

export const DURACION_SESION = '8h'
export const DURACION_CODIGO_2FA = '10m'

export class Tokens {
  constructor(private readonly secreto: string) {
    if (secreto.length < 16) throw new Error('JWT_SECRET debe tener al menos 16 caracteres')
  }

  firmarSesion(sesion: Sesion): string {
    return jwt.sign(sesion, this.secreto, { expiresIn: DURACION_SESION })
  }

  leerSesion(token: string): Sesion | null {
    try {
      const datos = jwt.verify(token, this.secreto) as Partial<Sesion>
      if (typeof datos.sub !== 'string' || (datos.rol !== 'tutor' && datos.rol !== 'alumno')) return null
      return { sub: datos.sub, rol: datos.rol }
    } catch {
      return null
    }
  }

  /** Genera un código de 6 dígitos y un token que guarda solo su HMAC (el código no viaja en claro). */
  crearDesafio2fa(tutorId: string): { codigo: string; token: string } {
    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const datos: Desafio2fa = { sub: tutorId, rol: 'tutor_2fa', codigo: this.hmac(tutorId, codigo) }
    return { codigo, token: jwt.sign(datos, this.secreto, { expiresIn: DURACION_CODIGO_2FA }) }
  }

  /** Devuelve el id del tutor si el código corresponde al token y no ha expirado. */
  verificarDesafio2fa(token: string, codigo: string): string | null {
    try {
      const datos = jwt.verify(token, this.secreto) as Partial<Desafio2fa>
      if (datos.rol !== 'tutor_2fa' || typeof datos.sub !== 'string' || typeof datos.codigo !== 'string') return null
      const esperado = Buffer.from(datos.codigo, 'hex')
      const recibido = Buffer.from(this.hmac(datos.sub, codigo), 'hex')
      return esperado.length === recibido.length && timingSafeEqual(esperado, recibido) ? datos.sub : null
    } catch {
      return null
    }
  }

  private hmac(tutorId: string, codigo: string): string {
    return createHmac('sha256', this.secreto).update(`${tutorId}:${codigo}`).digest('hex')
  }

  /** Middleware: exige un JWT de sesión con el rol indicado y deja la sesión en res.locals.sesion. */
  exigir(rol: Rol) {
    return (req: Request, res: Response, next: NextFunction) => {
      const [tipo, token] = (req.headers.authorization ?? '').split(' ')
      const sesion = tipo === 'Bearer' && token ? this.leerSesion(token) : null
      if (!sesion) return res.status(401).json({ error: 'Sesión inválida o expirada' })
      if (sesion.rol !== rol) return res.status(403).json({ error: 'No tienes permiso para esta acción' })
      res.locals.sesion = sesion
      next()
    }
  }
}
