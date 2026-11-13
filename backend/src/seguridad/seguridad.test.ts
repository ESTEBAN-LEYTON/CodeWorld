import { describe, expect, it } from 'vitest'
import { hashear, verificar } from './contrasenas.js'
import { Tokens } from './tokens.js'
import { Intentos2fa, MAX_INTENTOS_2FA } from './intentos2fa.js'

describe('contraseñas', () => {
  it('verifica la clave correcta y rechaza otra', async () => {
    const h = await hashear('clave-segura')
    expect(h).not.toContain('clave-segura')
    expect(await verificar('clave-segura', h)).toBe(true)
    expect(await verificar('otra-clave', h)).toBe(false)
  })

  it('dos hashes de la misma clave son distintos (sal aleatoria)', async () => {
    expect(await hashear('x123456')).not.toBe(await hashear('x123456'))
  })
})

describe('tokens', () => {
  const tokens = new Tokens('secreto-de-pruebas-0123456789')

  it('firma y lee una sesión', () => {
    const t = tokens.firmarSesion({ sub: 'abc', rol: 'tutor' })
    expect(tokens.leerSesion(t)).toEqual({ sub: 'abc', rol: 'tutor' })
  })

  it('rechaza un token firmado con otro secreto', () => {
    const otro = new Tokens('otro-secreto-de-pruebas-987654')
    expect(tokens.leerSesion(otro.firmarSesion({ sub: 'abc', rol: 'tutor' }))).toBeNull()
  })

  it('el desafío 2FA no contiene el código en claro y solo acepta el código correcto', () => {
    const { codigo, token } = tokens.crearDesafio2fa('tutor-1')
    expect(codigo).toMatch(/^\d{6}$/)
    expect(Buffer.from(token.split('.')[1], 'base64url').toString()).not.toContain(codigo)
    const desafio = tokens.leerDesafio2fa(token)!
    expect(desafio.tutorId).toBe('tutor-1')
    expect(tokens.codigoCorrecto(desafio, codigo)).toBe(true)
    const otro = codigo === '000000' ? '111111' : '000000'
    expect(tokens.codigoCorrecto(desafio, otro)).toBe(false)
  })

  it('cada desafío 2FA tiene un id único y no se acepta una sesión como desafío', () => {
    const a = tokens.leerDesafio2fa(tokens.crearDesafio2fa('tutor-1').token)!
    const b = tokens.leerDesafio2fa(tokens.crearDesafio2fa('tutor-1').token)!
    expect(a.jti).not.toBe(b.jti)
    expect(a.vence - a.emitido).toBe(600)
    expect(tokens.leerDesafio2fa(tokens.firmarSesion({ sub: 'tutor-1', rol: 'tutor' }))).toBeNull()
  })

  it('un token de desafío 2FA no sirve como sesión', () => {
    expect(tokens.leerSesion(tokens.crearDesafio2fa('tutor-1').token)).toBeNull()
  })
})

describe('Intentos2fa', () => {
  const vence = Date.now() + 600_000

  it(`anula el desafío al llegar a ${MAX_INTENTOS_2FA} fallos`, () => {
    const intentos = new Intentos2fa()
    for (let i = MAX_INTENTOS_2FA - 1; i >= 1; i--) expect(intentos.fallar('d1', vence)).toBe(i)
    expect(intentos.anulado('d1')).toBe(false)
    expect(intentos.fallar('d1', vence)).toBe(0)
    expect(intentos.anulado('d1')).toBe(true)
    expect(intentos.anulado('d2')).toBe(false)
  })

  it('olvida los desafíos vencidos', () => {
    let t = 0
    const intentos = new Intentos2fa(() => t)
    intentos.anular('viejo', 1000)
    expect(intentos.anulado('viejo')).toBe(true)
    t = 2000
    intentos.fallar('otro', 5000)
    expect(intentos.anulado('viejo')).toBe(false)
  })
})
