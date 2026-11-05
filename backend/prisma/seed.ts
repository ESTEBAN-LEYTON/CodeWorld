import 'dotenv/config'
import { crearDb } from '../src/db.js'
import { cargarContenido } from './cargar.js'

const db = crearDb()
const { niveles, desafios } = await cargarContenido(db)
console.log(`Contenido cargado: ${niveles} niveles, ${desafios} desafíos.`)
await db.$disconnect()
