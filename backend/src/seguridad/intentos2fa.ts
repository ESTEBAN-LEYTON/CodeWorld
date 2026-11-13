// Registro de intentos de cada código 2FA (riesgo R6). El código viaja firmado en un JWT sin estado,
// así que lo único que se guarda es cuántas veces se falló cada desafío y cuáles ya no sirven.
// Vive en memoria: alcanza para una sola instancia de la API, y un reinicio solo borra los contadores
// de los códigos vigentes, que vencen igual a los 10 minutos.

export const MAX_INTENTOS_2FA = 5

interface Registro {
  fallos: number
  anulado: boolean
  /** Momento en que vence el JWT del desafío (ms); después de eso el registro ya no hace falta. */
  vence: number
}

export class Intentos2fa {
  private readonly registros = new Map<string, Registro>()

  constructor(private readonly ahora: () => number = Date.now) {}

  /** El desafío ya se usó, se reemplazó por otro o agotó sus intentos. */
  anulado(jti: string): boolean {
    return this.registros.get(jti)?.anulado ?? false
  }

  /** Suma un fallo y devuelve cuántos intentos quedan; con 0, el desafío queda anulado. */
  fallar(jti: string, vence: number): number {
    const r = this.obtener(jti, vence)
    r.fallos++
    if (r.fallos >= MAX_INTENTOS_2FA) r.anulado = true
    return Math.max(0, MAX_INTENTOS_2FA - r.fallos)
  }

  anular(jti: string, vence: number): void {
    this.obtener(jti, vence).anulado = true
  }

  private obtener(jti: string, vence: number): Registro {
    this.limpiar()
    let r = this.registros.get(jti)
    if (!r) {
      r = { fallos: 0, anulado: false, vence }
      this.registros.set(jti, r)
    }
    return r
  }

  private limpiar() {
    const t = this.ahora()
    for (const [jti, r] of this.registros) if (r.vence < t) this.registros.delete(jti)
  }
}
