import { describe, expect, it } from 'vitest'
import { hashear, verificar } from './contrasenas.js'
import { Tokens } from './tokens.js'

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
    expect(tokens.verificarDesafio2fa(token, codigo)).toBe('tutor-1')
    const otro = codigo === '000000' ? '111111' : '000000'
    expect(tokens.verificarDesafio2fa(token, otro)).toBeNull()
  })

  it('un token de desafío 2FA no sirve como sesión', () => {
    expect(tokens.leerSesion(tokens.crearDesafio2fa('tutor-1').token)).toBeNull()
  })
})
