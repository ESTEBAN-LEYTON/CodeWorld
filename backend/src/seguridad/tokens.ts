import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
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

/** Desafío 2FA leído de un token válido: quién es, su id único y cuándo se emitió y vence (segundos). */
export interface LecturaDesafio2fa {
  tutorId: string
  jti: string
  emitido: number
  vence: number
  hmacCodigo: string
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
    return { codigo, token: jwt.sign(datos, this.secreto, { expiresIn: DURACION_CODIGO_2FA, jwtid: randomUUID() }) }
  }

  /** Lee un desafío 2FA firmado y vigente; null si es falso, de otro tipo o expiró. */
  leerDesafio2fa(token: string): LecturaDesafio2fa | null {
    try {
      const d = jwt.verify(token, this.secreto) as Partial<Desafio2fa> & jwt.JwtPayload
      if (d.rol !== 'tutor_2fa' || typeof d.sub !== 'string' || typeof d.codigo !== 'string') return null
      if (typeof d.jti !== 'string' || typeof d.iat !== 'number' || typeof d.exp !== 'number') return null
      return { tutorId: d.sub, jti: d.jti, emitido: d.iat, vence: d.exp, hmacCodigo: d.codigo }
    } catch {
      return null
    }
  }

  /** Compara el código ingresado con el del desafío en tiempo constante. */
  codigoCorrecto(desafio: LecturaDesafio2fa, codigo: string): boolean {
    const esperado = Buffer.from(desafio.hmacCodigo, 'hex')
    const recibido = Buffer.from(this.hmac(desafio.tutorId, codigo), 'hex')
    return esperado.length === recibido.length && timingSafeEqual(esperado, recibido)
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
