import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { crearApp } from './app.js'

describe('API', () => {
  const app = crearApp('http://localhost:5173')

  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ estado: 'ok', servicio: 'codeworld-api' })
  })

  it('rutas desconocidas devuelven 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
  })

  it('aplica cabeceras de seguridad', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })
})
