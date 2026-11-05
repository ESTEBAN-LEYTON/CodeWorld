import { guardar, leer, type Almacen } from '../almacen'
import type { Progreso, ResultadoEjecucion } from './types'

// GestorProgreso: guarda el progreso por desafío en el navegador (AlmacenLocal) y lo envía
// por lotes a ServicioProgreso cuando hay conexión (riesgo R2, offline-first).

interface Estado {
  completados: Record<string, Progreso>
  /** Desafíos completados que el servidor todavía no confirma. */
  pendientes: string[]
  intentos: Record<string, number>
}

export interface RespuestaSync {
  registros: Progreso[]
}

export type Enviar = (registros: Progreso[]) => Promise<RespuestaSync>

export class GestorProgreso {
  private readonly clave: string
  private readonly almacen: Almacen | undefined
  private estado: Estado

  constructor(alumnoId: string, almacen?: Almacen) {
    this.clave = `codeworld.progreso.${alumnoId}`
    this.almacen = almacen
    this.estado = leer<Estado>(this.clave, { completados: {}, pendientes: [], intentos: {} }, almacen)
  }

  get completados(): string[] {
    return Object.keys(this.estado.completados)
  }

  get pendientes(): number {
    return this.estado.pendientes.length
  }

  estaCompletado(desafioId: string) {
    return desafioId in this.estado.completados
  }

  /** Se llama en cada ejecución; devuelve el Progreso nuevo solo la primera vez que se logra el desafío. */
  registrarResultado(desafioId: string, resultado: ResultadoEjecucion): Progreso | null {
    const intentos = (this.estado.intentos[desafioId] ?? 0) + 1
    this.estado.intentos[desafioId] = intentos
    let nuevo: Progreso | null = null
    if (resultado.estado === 'EXITO' && !this.estaCompletado(desafioId)) {
      nuevo = { desafioId, completadoEn: new Date().toISOString(), intentos }
      this.estado.completados[desafioId] = nuevo
      this.estado.pendientes.push(desafioId)
    }
    this.guardarLocal()
    return nuevo
  }

  /** Envía los pendientes y fusiona lo que el servidor ya tenía (p. ej. desde otro dispositivo). */
  async sincronizar(enviar: Enviar): Promise<void> {
    const lote = this.estado.pendientes.map((id) => this.estado.completados[id]).filter(Boolean)
    const res = await enviar(lote)
    // Todo lo enviado quedó procesado: aceptado, o rechazado porque el desafío ya no existe.
    const enviados = new Set(lote.map((p) => p.desafioId))
    this.estado.pendientes = this.estado.pendientes.filter((id) => !enviados.has(id))
    for (const p of res.registros) {
      if (!this.estaCompletado(p.desafioId)) this.estado.completados[p.desafioId] = p
    }
    this.guardarLocal()
  }

  private guardarLocal() {
    guardar(this.clave, this.estado, this.almacen)
  }
}
