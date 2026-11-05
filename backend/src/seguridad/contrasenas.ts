import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

// Hash de contraseñas con scrypt (sal aleatoria por usuario). Formato: scrypt$<sal>$<hash>.

const scryptAsync = promisify(scrypt) as (clave: string, sal: Buffer, largo: number) => Promise<Buffer>

export async function hashear(clave: string): Promise<string> {
  const sal = randomBytes(16)
  const hash = await scryptAsync(clave, sal, 64)
  return `scrypt$${sal.toString('base64')}$${hash.toString('base64')}`
}

export async function verificar(clave: string, guardado: string): Promise<boolean> {
  const [algoritmo, sal, hash] = guardado.split('$')
  if (algoritmo !== 'scrypt' || !sal || !hash) return false
  const esperado = Buffer.from(hash, 'base64')
  const calculado = await scryptAsync(clave, Buffer.from(sal, 'base64'), esperado.length)
  return timingSafeEqual(esperado, calculado)
}
