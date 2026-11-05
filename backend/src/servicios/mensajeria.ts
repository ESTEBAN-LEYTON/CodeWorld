// Proveedor externo de correo (diagrama de despliegue). Sin BREVO_API_KEY el código se escribe
// en la consola del servidor, lo que basta para desarrollo y pruebas.

export interface EnviadorCodigo {
  enviar(contacto: string, codigo: string): Promise<void>
}

export const enviadorConsola: EnviadorCodigo = {
  async enviar(contacto, codigo) {
    console.log(`[2FA] Código para ${ocultar(contacto)}: ${codigo} (válido 10 minutos)`)
  },
}

const URL_BREVO = 'https://api.brevo.com/v3/smtp/email'

/** Se usa la API HTTP y no SMTP porque algunos hostings gratuitos bloquean los puertos de SMTP. */
export function enviadorBrevo(apiKey: string, remitente: string, pedir: typeof fetch = fetch): EnviadorCodigo {
  return {
    async enviar(contacto, codigo) {
      const res = await pedir(URL_BREVO, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'CodeWorld', email: remitente },
          to: [{ email: contacto }],
          subject: `Tu código de CodeWorld: ${codigo}`,
          textContent: `Tu código de verificación de CodeWorld es ${codigo}. Vence en 10 minutos. Si no intentaste entrar, cambia tu contraseña.`,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) throw new Error(`Brevo respondió ${res.status}`)
    },
  }
}

export function enviadorDesdeEntorno(entorno: NodeJS.ProcessEnv = process.env): EnviadorCodigo {
  const { BREVO_API_KEY: apiKey, CORREO_REMITENTE: remitente } = entorno
  if (apiKey && remitente) return enviadorBrevo(apiKey, remitente)
  if (entorno.NODE_ENV === 'production') {
    console.warn('Sin BREVO_API_KEY y CORREO_REMITENTE: los códigos 2FA quedarán en los registros del servidor.')
  }
  return enviadorConsola
}

/** Muestra solo el inicio y el final del contacto para no exponerlo en los registros. */
export function ocultar(contacto: string): string {
  if (contacto.length <= 4) return '****'
  return `${contacto.slice(0, 2)}${'*'.repeat(Math.max(contacto.length - 4, 3))}${contacto.slice(-2)}`
}
