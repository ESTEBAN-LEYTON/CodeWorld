import { Router } from 'express'
import { z } from 'zod'
import type { Db } from '../db.js'
import { hashear, verificar } from '../seguridad/contrasenas.js'
import type { Sesion, Tokens } from '../seguridad/tokens.js'
import { ocultar, type EnviadorCodigo } from './mensajeria.js'
import { clave, nombreUsuario, validar } from './validacion.js'

// ServicioAutenticacion: JWT + doble factor del tutor, registro del alumno y consentimiento.
// Zero-Data (Ley N.° 19.628): del alumno solo se guardan usuario, clave (hash), id anónimo y edad.

const CREDENCIALES_INVALIDAS = { error: 'Usuario o contraseña incorrectos' }

export function servicioAutenticacion(db: Db, tokens: Tokens, enviador: EnviadorCodigo) {
  const r = Router()

  r.post(
    '/auth/tutor/registro',
    validar(
      z.object({
        username: nombreUsuario,
        password: clave,
        contacto: z.string().trim().max(120).pipe(z.email('ingresa un correo válido')),
      }),
    ),
    async (req, res) => {
      const { username, password, contacto } = req.body
      if (await db.tutor.findUnique({ where: { username } })) {
        return res.status(409).json({ error: 'Ese nombre de usuario ya existe' })
      }
      const tutor = await db.tutor.create({
        data: { username, passwordHash: await hashear(password), contactoVerificado: contacto },
      })
      res.status(201).json({ id: tutor.id, username: tutor.username })
    },
  )

  // Paso 1: contraseña correcta -> se envía un código al contacto del tutor.
  r.post('/auth/tutor/login', validar(z.object({ username: z.string(), password: z.string() })), async (req, res) => {
    const tutor = await db.tutor.findUnique({ where: { username: req.body.username } })
    if (!tutor || !(await verificar(req.body.password, tutor.passwordHash))) {
      return res.status(401).json(CREDENCIALES_INVALIDAS)
    }
    const { codigo, token } = tokens.crearDesafio2fa(tutor.id)
    try {
      await enviador.enviar(tutor.contactoVerificado, codigo)
    } catch (e) {
      console.error('No se pudo enviar el código 2FA:', e)
      return res.status(503).json({ error: 'No pudimos enviar el código de verificación. Intenta de nuevo en unos minutos.' })
    }
    res.json({ desafio2fa: token, enviadoA: ocultar(tutor.contactoVerificado) })
  })

  // Paso 2: código correcto -> sesión de tutor.
  r.post(
    '/auth/tutor/verificar',
    validar(z.object({ desafio2fa: z.string(), codigo: z.string().regex(/^\d{6}$/, 'son 6 dígitos') })),
    async (req, res) => {
      const tutorId = tokens.verificarDesafio2fa(req.body.desafio2fa, req.body.codigo)
      const tutor = tutorId ? await db.tutor.findUnique({ where: { id: tutorId } }) : null
      if (!tutor) return res.status(401).json({ error: 'Código incorrecto o expirado' })
      res.json({ token: tokens.firmarSesion({ sub: tutor.id, rol: 'tutor' }), username: tutor.username })
    },
  )

  r.post('/auth/alumno/login', validar(z.object({ username: z.string(), password: z.string() })), async (req, res) => {
    const alumno = await db.alumno.findUnique({ where: { username: req.body.username } })
    if (!alumno || !(await verificar(req.body.password, alumno.passwordHash))) {
      return res.status(401).json(CREDENCIALES_INVALIDAS)
    }
    res.json({
      token: tokens.firmarSesion({ sub: alumno.id, rol: 'alumno' }),
      alumno: { id: alumno.id, username: alumno.username },
    })
  })

  // Registrar alumno «include» Otorgar consentimiento: ambos se guardan en una sola transacción.
  r.post(
    '/alumnos',
    tokens.exigir('tutor'),
    validar(
      z.object({
        username: nombreUsuario,
        password: clave,
        edad: z.number().int().min(9, 'CodeWorld es para jóvenes de 9 a 15 años').max(15, 'CodeWorld es para jóvenes de 9 a 15 años'),
        consentimiento: z.literal(true, { error: 'el tutor debe otorgar el consentimiento' }),
      }),
    ),
    async (req, res) => {
      const { sub: tutorId } = res.locals.sesion as Sesion
      const { username, password, edad } = req.body
      if (await db.alumno.findUnique({ where: { username } })) {
        return res.status(409).json({ error: 'Ese nombre de usuario ya existe' })
      }
      const passwordHash = await hashear(password)
      const alumno = await db.$transaction(async (tx) => {
        const a = await tx.alumno.create({ data: { tutorId, username, passwordHash, edad } })
        await tx.consentimiento.create({ data: { tutorId, alumnoId: a.id, metodoVerificacion: 'login_2fa_tutor' } })
        return a
      })
      res.status(201).json({ id: alumno.id, username: alumno.username, edad: alumno.edad, anonId: alumno.anonId })
    },
  )

  return r
}
