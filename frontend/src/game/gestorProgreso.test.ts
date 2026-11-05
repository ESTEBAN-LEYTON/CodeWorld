import { describe, expect, it, vi } from 'vitest'
import type { Almacen } from '../almacen'
import { GestorProgreso } from './gestorProgreso'
import type { ResultadoEjecucion } from './types'

function almacenEnMemoria(): Almacen {
  const m = new Map<string, string>()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) }
}

const exito: ResultadoEjecucion = { estado: 'EXITO', traza: [], patronError: null, pasos: 3 }
const choque: ResultadoEjecucion = { estado: 'ERROR', traza: [], patronError: 'choque', pasos: 2 }

describe('GestorProgreso', () => {
  it('registra el progreso solo en caso de EXITO y cuenta los intentos', () => {
    const g = new GestorProgreso('alumno-1', almacenEnMemoria())
    expect(g.registrarResultado('d1', choque)).toBeNull()
    expect(g.registrarResultado('d1', choque)).toBeNull()
    const p = g.registrarResultado('d1', exito)
    expect(p).toMatchObject({ desafioId: 'd1', intentos: 3 })
    expect(g.pendientes).toBe(1)
  })

  it('repetir un desafío ya logrado no genera un progreso nuevo', () => {
    const g = new GestorProgreso('alumno-1', almacenEnMemoria())
    g.registrarResultado('d1', exito)
    expect(g.registrarResultado('d1', exito)).toBeNull()
    expect(g.pendientes).toBe(1)
  })

  it('el progreso sobrevive a recargar la página (localStorage)', () => {
    const almacen = almacenEnMemoria()
    new GestorProgreso('alumno-1', almacen).registrarResultado('d1', exito)
    const otra = new GestorProgreso('alumno-1', almacen)
    expect(otra.completados).toEqual(['d1'])
    expect(otra.pendientes).toBe(1)
  })

  it('cada alumno tiene su propio progreso en el mismo dispositivo', () => {
    const almacen = almacenEnMemoria()
    new GestorProgreso('alumno-1', almacen).registrarResultado('d1', exito)
    expect(new GestorProgreso('alumno-2', almacen).completados).toEqual([])
  })

  it('sincronizar envía los pendientes, los vacía y fusiona lo que el servidor ya tenía', async () => {
    const g = new GestorProgreso('alumno-1', almacenEnMemoria())
    g.registrarResultado('d1', exito)
    const enviar = vi.fn(async () => ({
      registros: [
        { desafioId: 'd1', completadoEn: '2026-10-10T10:00:00Z', intentos: 1 },
        { desafioId: 'd9', completadoEn: '2026-10-09T10:00:00Z', intentos: 2 },
      ],
    }))
    await g.sincronizar(enviar)
    expect(enviar).toHaveBeenCalledWith([expect.objectContaining({ desafioId: 'd1' })])
    expect(g.pendientes).toBe(0)
    expect(g.completados.sort()).toEqual(['d1', 'd9'])
  })

  it('sin conexión los pendientes se conservan para el próximo intento', async () => {
    const g = new GestorProgreso('alumno-1', almacenEnMemoria())
    g.registrarResultado('d1', exito)
    await expect(g.sincronizar(() => Promise.reject(new Error('sin red')))).rejects.toThrow()
    expect(g.pendientes).toBe(1)
  })
})
