import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { crearDb, type Db } from './db.js'
import { crearApp } from './app.js'
import { appDePruebas, enviadorFalso, reiniciarDb, SECRETO, urlPruebas } from './test/utilidades.js'

// Pruebas de integración de la API contra PostgreSQL (TEST_DATABASE_URL).

describe.skipIf(!urlPruebas)('API de CodeWorld', () => {
  let db: Db
  let app: Express
  let correo: ReturnType<typeof enviadorFalso>

  beforeAll(() => {
    db = crearDb(urlPruebas)
  })

  beforeEach(async () => {
    await reiniciarDb(db)
    correo = enviadorFalso()
    app = appDePruebas(db, correo.enviador)
  })

  afterAll(async () => {
    await db?.$disconnect()
  })

  async function tutorConSesion(username = 'mama_ana') {
    await request(app).post('/api/auth/tutor/registro').send({ username, password: 'clave123', contacto: 'ana@correo.cl' })
    const login = await request(app).post('/api/auth/tutor/login').send({ username, password: 'clave123' })
    const verif = await request(app)
      .post('/api/auth/tutor/verificar')
      .send({ desafio2fa: login.body.desafio2fa, codigo: correo.ultimoCodigo() })
    return verif.body.token as string
  }

  async function alumnoConSesion(tutor: string, username = 'gato_rapido') {
    await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${tutor}`)
      .send({ username, password: 'gato123', edad: 11, consentimiento: true })
    const login = await request(app).post('/api/auth/alumno/login').send({ username, password: 'gato123' })
    return login.body.token as string
  }

  it('health informa que la base de datos responde', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ estado: 'ok', baseDeDatos: 'ok' })
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('rutas desconocidas devuelven 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
  })

  describe('ServicioAutenticacion', () => {
    it('login del tutor en dos pasos: contraseña y código 2FA', async () => {
      await request(app).post('/api/auth/tutor/registro').send({ username: 'papa', password: 'clave123', contacto: 'papa11112222@correo.cl' })
      const paso1 = await request(app).post('/api/auth/tutor/login').send({ username: 'papa', password: 'clave123' })
      expect(paso1.status).toBe(200)
      expect(paso1.body.token).toBeUndefined()
      expect(paso1.body.enviadoA).not.toContain('11112222')

      const malo = correo.ultimoCodigo() === '000000' ? '111111' : '000000'
      const fallo = await request(app).post('/api/auth/tutor/verificar').send({ desafio2fa: paso1.body.desafio2fa, codigo: malo })
      expect(fallo.status).toBe(401)

      const paso2 = await request(app)
        .post('/api/auth/tutor/verificar')
        .send({ desafio2fa: paso1.body.desafio2fa, codigo: correo.ultimoCodigo() })
      expect(paso2.status).toBe(200)
      expect(paso2.body.token).toBeTruthy()
    })

    async function pedirCodigo(aplicacion = app) {
      await request(aplicacion).post('/api/auth/tutor/registro').send({ username: 'papa', password: 'clave123', contacto: 'p@correo.cl' })
      const login = await request(aplicacion).post('/api/auth/tutor/login').send({ username: 'papa', password: 'clave123' })
      return login.body.desafio2fa as string
    }
    const verificarCodigo = (desafio2fa: string, codigo: string, aplicacion = app) =>
      request(aplicacion).post('/api/auth/tutor/verificar').send({ desafio2fa, codigo })
    const codigoMalo = () => (correo.ultimoCodigo() === '000000' ? '111111' : '000000')

    it('R6: tras 5 códigos incorrectos, ni el correcto sirve y pide iniciar sesión de nuevo', async () => {
      const desafio = await pedirCodigo()
      for (let quedan = 4; quedan >= 1; quedan--) {
        const r = await verificarCodigo(desafio, codigoMalo())
        expect(r.status).toBe(401)
        expect(r.body.error).toContain(quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`)
      }
      const quinto = await verificarCodigo(desafio, codigoMalo())
      expect(quinto.body).toMatchObject({ reiniciar: true })
      const correcto = await verificarCodigo(desafio, correo.ultimoCodigo())
      expect(correcto.status).toBe(401)
      expect(correcto.body.token).toBeUndefined()
    })

    it('R6: un código sirve una sola vez', async () => {
      const desafio = await pedirCodigo()
      expect((await verificarCodigo(desafio, correo.ultimoCodigo())).status).toBe(200)
      expect((await verificarCodigo(desafio, correo.ultimoCodigo())).status).toBe(401)
    })

    it('R6: el reenvío exige esperar 60 s', async () => {
      const desafio = await pedirCodigo()
      const r = await request(app).post('/api/auth/tutor/reenviar').send({ desafio2fa: desafio })
      expect(r.status).toBe(429)
      expect(r.body.esperaReenvio).toBeGreaterThan(55)
    })

    it('R6: el reenvío manda un código nuevo y anula el anterior', async () => {
      const sinEspera = appDePruebas(db, correo.enviador, 0)
      const viejo = await pedirCodigo(sinEspera)
      const codigoViejo = correo.ultimoCodigo()
      const r = await request(sinEspera).post('/api/auth/tutor/reenviar').send({ desafio2fa: viejo })
      expect(r.status).toBe(200)
      expect(r.body.enviadoA).toBeTruthy()
      expect((await verificarCodigo(viejo, codigoViejo, sinEspera)).status).toBe(401)
      expect((await request(sinEspera).post('/api/auth/tutor/reenviar').send({ desafio2fa: viejo })).status).toBe(401)
      const nuevo = await verificarCodigo(r.body.desafio2fa, correo.ultimoCodigo(), sinEspera)
      expect(nuevo.status).toBe(200)
      expect(nuevo.body.token).toBeTruthy()
    })

    it('rechaza contraseña incorrecta sin revelar si el usuario existe', async () => {
      await request(app).post('/api/auth/tutor/registro').send({ username: 'papa', password: 'clave123', contacto: 'p@correo.cl' })
      const a = await request(app).post('/api/auth/tutor/login').send({ username: 'papa', password: 'mala' })
      const b = await request(app).post('/api/auth/tutor/login').send({ username: 'no_existe', password: 'mala' })
      expect(a.status).toBe(401)
      expect(b.body).toEqual(a.body)
    })

    it('el tutor debe registrar un correo válido para recibir el 2FA', async () => {
      const res = await request(app).post('/api/auth/tutor/registro').send({ username: 'papa', password: 'clave123', contacto: '+56911112222' })
      expect(res.status).toBe(400)
      expect(await db.tutor.count()).toBe(0)
    })

    it('informa 503 si el proveedor de correo falla y no entrega una sesión', async () => {
      await request(app).post('/api/auth/tutor/registro').send({ username: 'papa', password: 'clave123', contacto: 'p@correo.cl' })
      const sinCorreo = appDePruebas(db, {
        async enviar() {
          throw new Error('proveedor caído')
        },
      })
      const res = await request(sinCorreo).post('/api/auth/tutor/login').send({ username: 'papa', password: 'clave123' })
      expect(res.status).toBe(503)
      expect(res.body.desafio2fa).toBeUndefined()
    })

    it('el rate limiting corta la fuerza bruta en el login', async () => {
      const limitada = crearApp({ db, jwtSecret: SECRETO, enviador: correo.enviador, limites: { api: 100, login: 2 } })
      const intento = () => request(limitada).post('/api/auth/alumno/login').send({ username: 'nadie', password: 'mala' })
      expect((await intento()).status).toBe(401)
      expect((await intento()).status).toBe(401)
      expect((await intento()).status).toBe(429)
    })

    it('detrás de un proxy el límite se cuenta por cada usuario y no por el proxy', async () => {
      const limitada = crearApp({ db, jwtSecret: SECRETO, enviador: correo.enviador, limites: { api: 100, login: 1 }, saltosProxy: 1 })
      const desde = (ip: string) =>
        request(limitada).post('/api/auth/alumno/login').set('X-Forwarded-For', ip).send({ username: 'nadie', password: 'mala' })
      expect((await desde('10.0.0.1')).status).toBe(401)
      expect((await desde('10.0.0.1')).status).toBe(429)
      expect((await desde('10.0.0.2')).status).toBe(401)
    })

    it('no permite nombres de usuario repetidos', async () => {
      const datos = { username: 'papa', password: 'clave123', contacto: 'p@correo.cl' }
      await request(app).post('/api/auth/tutor/registro').send(datos)
      expect((await request(app).post('/api/auth/tutor/registro').send(datos)).status).toBe(409)
    })

    it('registrar alumno guarda el consentimiento y solo datos mínimos (Zero-Data)', async () => {
      const tutor = await tutorConSesion()
      const res = await request(app)
        .post('/api/alumnos')
        .set('Authorization', `Bearer ${tutor}`)
        .send({ username: 'gato_rapido', password: 'gato123', edad: 11, consentimiento: true })
      expect(res.status).toBe(201)
      expect(res.body.anonId).toBeTruthy()

      const alumno = await db.alumno.findUniqueOrThrow({ where: { username: 'gato_rapido' }, include: { consentimientos: true } })
      expect(alumno.consentimientos).toHaveLength(1)
      expect(alumno.passwordHash).not.toContain('gato123')
      expect(Object.keys(alumno).sort()).toEqual(
        ['anonId', 'consentimientos', 'createdAt', 'edad', 'id', 'passwordHash', 'tutorId', 'username'].sort(),
      )
    })

    it('RF03: la base de datos impide modificar o borrar un consentimiento', async () => {
      await alumnoConSesion(await tutorConSesion())
      const { id } = await db.consentimiento.findFirstOrThrow()
      await expect(db.consentimiento.update({ where: { id }, data: { metodoVerificacion: 'alterado' } })).rejects.toThrow('inmutable')
      await expect(db.consentimiento.delete({ where: { id } })).rejects.toThrow('inmutable')
      expect((await db.consentimiento.findFirstOrThrow()).metodoVerificacion).toBe('login_2fa_tutor')
    })

    it('sin consentimiento no se registra al alumno', async () => {
      const tutor = await tutorConSesion()
      const res = await request(app)
        .post('/api/alumnos')
        .set('Authorization', `Bearer ${tutor}`)
        .send({ username: 'gato_rapido', password: 'gato123', edad: 11, consentimiento: false })
      expect(res.status).toBe(400)
      expect(await db.alumno.count()).toBe(0)
    })

    it('valida el rango de edad 9 a 15', async () => {
      const tutor = await tutorConSesion()
      const res = await request(app)
        .post('/api/alumnos')
        .set('Authorization', `Bearer ${tutor}`)
        .send({ username: 'peque', password: 'gato123', edad: 6, consentimiento: true })
      expect(res.status).toBe(400)
    })

    it('un alumno no puede registrar alumnos ni ver el panel del tutor', async () => {
      const alumno = await alumnoConSesion(await tutorConSesion())
      const reg = await request(app)
        .post('/api/alumnos')
        .set('Authorization', `Bearer ${alumno}`)
        .send({ username: 'otro', password: 'gato123', edad: 11, consentimiento: true })
      expect(reg.status).toBe(403)
      expect((await request(app).get('/api/tutor/alumnos').set('Authorization', `Bearer ${alumno}`)).status).toBe(403)
    })

    it('rechaza peticiones sin token', async () => {
      expect((await request(app).get('/api/progreso')).status).toBe(401)
    })
  })

  describe('ServicioContenido', () => {
    it('entrega niveles ordenados con desafíos y una guía por cada patrón de error', async () => {
      const res = await request(app).get('/api/niveles')
      expect(res.status).toBe(200)
      expect(res.body.map((n: { id: string }) => n.id)).toEqual(['secuencias', 'ciclos', 'condiciones'])
      for (const nivel of res.body) {
        for (const d of nivel.desafios) {
          expect(d.laberinto.celdas.length).toBeGreaterThan(0)
          expect(d.guias.map((g: { patronError: string }) => g.patronError).sort()).toEqual(
            ['choque', 'incompleto', 'limite_pasos', 'vacio'],
          )
        }
      }
    })
  })

  describe('ServicioProgreso', () => {
    it('flujo completo: el alumno sincroniza y el tutor ve el avance', async () => {
      const tutor = await tutorConSesion()
      const alumno = await alumnoConSesion(tutor)

      const sync = await request(app)
        .post('/api/progreso/sincronizar')
        .set('Authorization', `Bearer ${alumno}`)
        .send({
          registros: [
            { desafioId: 'secuencias-1', completadoEn: '2026-10-10T15:00:00Z', intentos: 1 },
            { desafioId: 'secuencias-2', completadoEn: '2026-10-10T15:05:00Z', intentos: 3 },
            { desafioId: 'secuencias-3', completadoEn: '2026-10-10T15:09:00Z', intentos: 1 },
            { desafioId: 'secuencias-4', completadoEn: '2026-10-10T15:15:00Z', intentos: 2 },
            { desafioId: 'ciclos-1', completadoEn: '2026-10-10T15:20:00Z', intentos: 1 },
          ],
        })
      expect(sync.status).toBe(200)
      // 10 + 15 + 15 + 20 de Secuencias y 20 de Ciclos; un nivel se completa solo con todos sus desafíos.
      expect(sync.body.xpTotal).toBe(80)
      expect(sync.body.nivelesCompletados).toEqual(['secuencias'])

      const lista = await request(app).get('/api/tutor/alumnos').set('Authorization', `Bearer ${tutor}`)
      expect(lista.body).toEqual([
        expect.objectContaining({ username: 'gato_rapido', xpTotal: 80, desafiosCompletados: 5, totalDesafios: 12 }),
      ])

      const detalle = await request(app)
        .get(`/api/tutor/alumnos/${lista.body[0].id}/progreso`)
        .set('Authorization', `Bearer ${tutor}`)
      expect(detalle.body.registros).toHaveLength(5)
    })

    it('la sincronización es idempotente y el XP lo fija el servidor', async () => {
      const alumno = await alumnoConSesion(await tutorConSesion())
      const lote = { registros: [{ desafioId: 'ciclos-1', completadoEn: '2026-10-10T15:00:00Z', intentos: 2 }] }
      await request(app).post('/api/progreso/sincronizar').set('Authorization', `Bearer ${alumno}`).send(lote)
      const otra = await request(app).post('/api/progreso/sincronizar').set('Authorization', `Bearer ${alumno}`).send(lote)
      expect(otra.body.xpTotal).toBe(20)
      expect(await db.progreso.count()).toBe(1)
    })

    it('ignora desafíos que no existen', async () => {
      const alumno = await alumnoConSesion(await tutorConSesion())
      const res = await request(app)
        .post('/api/progreso/sincronizar')
        .set('Authorization', `Bearer ${alumno}`)
        .send({ registros: [{ desafioId: 'inventado', completadoEn: '2026-10-10T15:00:00Z', intentos: 1 }] })
      expect(res.body).toMatchObject({ aceptados: [], rechazados: 1, xpTotal: 0 })
    })

    it('un tutor no puede ver el progreso de alumnos de otro tutor', async () => {
      const tutorA = await tutorConSesion('tutor_a')
      await alumnoConSesion(tutorA)
      const alumno = await db.alumno.findFirstOrThrow()
      const tutorB = await tutorConSesion('tutor_b')
      const res = await request(app).get(`/api/tutor/alumnos/${alumno.id}/progreso`).set('Authorization', `Bearer ${tutorB}`)
      expect(res.status).toBe(404)
    })
  })
})
