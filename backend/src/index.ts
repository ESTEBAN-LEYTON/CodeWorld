import 'dotenv/config'
import { crearApp } from './app.js'
import { crearDb } from './db.js'
import { enviadorDesdeEntorno } from './servicios/mensajeria.js'

const puerto = Number(process.env.PORT ?? 3000)
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('Falta JWT_SECRET (ver backend/.env.example)')

const limites = process.env.LIMITE_API && process.env.LIMITE_LOGIN
  ? { api: Number(process.env.LIMITE_API), login: Number(process.env.LIMITE_LOGIN) }
  : undefined

crearApp({
  db: crearDb(),
  jwtSecret,
  enviador: enviadorDesdeEntorno(),
  limites,
  saltosProxy: Number(process.env.SALTOS_PROXY ?? 0),
}).listen(puerto, () => {
  console.log(`CodeWorld API escuchando en http://localhost:${puerto}/api`)
})
