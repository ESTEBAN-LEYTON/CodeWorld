// Cliente HTTP hacia el ApiGateway. En desarrollo Vite redirige /api al backend (vite.config.ts).

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ErrorApi extends Error {
  readonly status: number
  /** Cuerpo de la respuesta de error, por si trae datos además del mensaje. */
  readonly datos: Record<string, unknown>
  constructor(status: number, mensaje: string, datos: Record<string, unknown> = {}) {
    super(mensaje)
    this.status = status
    this.datos = datos
  }
  /** status 0: no hubo respuesta (sin conexión o servidor caído). */
  get sinConexion() {
    return this.status === 0
  }
}

interface Opciones {
  metodo?: 'GET' | 'POST'
  cuerpo?: unknown
  token?: string
}

export async function llamar<T>(ruta: string, { metodo = 'GET', cuerpo, token }: Opciones = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor.')
  }
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new ErrorApi(res.status, datos.error ?? `Error ${res.status}`, datos)
  return datos as T
}

export function mensajeDeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado.'
}
