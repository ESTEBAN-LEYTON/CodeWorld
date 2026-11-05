import { describe, expect, it, vi } from 'vitest'
import { enviadorBrevo, enviadorConsola, enviadorDesdeEntorno } from './mensajeria.js'

describe('mensajería del código 2FA', () => {
  it('envía el código al correo del tutor mediante la API de Brevo', async () => {
    const pedir = vi.fn(async () => new Response('{}', { status: 201 }))
    await enviadorBrevo('clave', 'no-responder@codeworld.cl', pedir as typeof fetch).enviar('ana@correo.cl', '123456')

    const [url, opciones] = pedir.mock.calls[0] as unknown as [string, RequestInit]
    const cuerpo = JSON.parse(String(opciones.body))
    expect(url).toBe('https://api.brevo.com/v3/smtp/email')
    expect(opciones.headers).toMatchObject({ 'api-key': 'clave' })
    expect(cuerpo.to).toEqual([{ email: 'ana@correo.cl' }])
    expect(cuerpo.sender.email).toBe('no-responder@codeworld.cl')
    expect(cuerpo.textContent).toContain('123456')
  })

  it('falla si el proveedor rechaza el envío', async () => {
    const pedir = vi.fn(async () => new Response('{}', { status: 401 }))
    await expect(enviadorBrevo('mala', 'a@b.cl', pedir as typeof fetch).enviar('ana@correo.cl', '123456')).rejects.toThrow('401')
  })

  it('usa la consola si falta la clave o el remitente', () => {
    expect(enviadorDesdeEntorno({ BREVO_API_KEY: 'clave' })).toBe(enviadorConsola)
    expect(enviadorDesdeEntorno({ CORREO_REMITENTE: 'a@b.cl' })).toBe(enviadorConsola)
    expect(enviadorDesdeEntorno({ BREVO_API_KEY: 'clave', CORREO_REMITENTE: 'a@b.cl' })).not.toBe(enviadorConsola)
  })
})
