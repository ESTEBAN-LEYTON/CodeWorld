import 'dotenv/config'
import { crearApp } from '../app.js'
import type { Db } from '../db.js'
import { cargarContenido } from '../../prisma/cargar.js'
import type { EnviadorCodigo } from '../servicios/mensajeria.js'

export const urlPruebas = process.env.TEST_DATABASE_URL
export const SECRETO = 'secreto-de-pruebas-0123456789'

/** Enviador falso: guarda el último código en vez de mandarlo por correo/SMS. */
export function enviadorFalso() {
  const enviados: { contacto: string; codigo: string }[] = []
  const enviador: EnviadorCodigo = {
    async enviar(contacto, codigo) {
      enviados.push({ contacto, codigo })
    },
  }
  return { enviador, ultimoCodigo: () => enviados.at(-1)?.codigo ?? '' }
}

/** Vacía la base de pruebas y recarga el contenido de los niveles. */
export async function reiniciarDb(db: Db) {
  await db.$executeRawUnsafe(
    'TRUNCATE progreso, consentimiento, alumno, tutor, guia_correctiva, desafio, nivel RESTART IDENTITY CASCADE',
  )
  await cargarContenido(db)
}

export function appDePruebas(db: Db, enviador: EnviadorCodigo, esperaReenvio2fa?: number) {
  return crearApp({ db, jwtSecret: SECRETO, enviador, limites: { api: 10_000, login: 10_000 }, esperaReenvio2fa })
}
