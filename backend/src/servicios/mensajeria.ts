// Proveedor externo de correo/SMS (diagrama de despliegue). En desarrollo el código
// se escribe en la consola del servidor; en producción se reemplaza por un proveedor real.

export interface EnviadorCodigo {
  enviar(contacto: string, codigo: string): Promise<void>
}

export const enviadorConsola: EnviadorCodigo = {
  async enviar(contacto, codigo) {
    console.log(`[2FA] Código para ${ocultar(contacto)}: ${codigo} (válido 10 minutos)`)
  },
}

/** Muestra solo el inicio y el final del contacto para no exponerlo en los registros. */
export function ocultar(contacto: string): string {
  if (contacto.length <= 4) return '****'
  return `${contacto.slice(0, 2)}${'*'.repeat(Math.max(contacto.length - 4, 3))}${contacto.slice(-2)}`
}
