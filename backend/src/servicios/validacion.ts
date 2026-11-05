import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

/** Valida req.body con un esquema zod; responde 400 con el primer problema en español. */
export function validar<T extends z.ZodType>(esquema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = esquema.safeParse(req.body)
    if (!r.success) {
      const p = r.error.issues[0]
      return res.status(400).json({ error: `Dato inválido en "${p.path.join('.') || 'cuerpo'}": ${p.message}` })
    }
    req.body = r.data
    next()
  }
}

export const nombreUsuario = z
  .string()
  .trim()
  .min(3, 'debe tener al menos 3 caracteres')
  .max(30, 'debe tener como máximo 30 caracteres')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'solo letras, números, punto, guion y guion bajo')

export const clave = z.string().min(6, 'debe tener al menos 6 caracteres').max(100)
