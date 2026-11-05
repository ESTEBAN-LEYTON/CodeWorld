import 'dotenv/config'
import { execSync } from 'node:child_process'
import express from 'express'
import { crearApp } from '../app.js'
import { crearDb } from '../db.js'
import { enviadorFalso, reiniciarDb, SECRETO, urlPruebas } from './utilidades.js'

// Servidor de las pruebas e2e: VACÍA la base de pruebas y expone el último código 2FA para que el
// navegador pueda completar el login. src/test no se compila, así que nunca llega a producción.

if (!urlPruebas) throw new Error('Las pruebas e2e necesitan TEST_DATABASE_URL')

execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: urlPruebas }, stdio: 'ignore' })
const db = crearDb(urlPruebas)
await reiniciarDb(db)

const correo = enviadorFalso()
const raiz = express()
raiz.get('/__e2e/codigo', (_req, res) => {
  res.json({ codigo: correo.ultimoCodigo() })
})
raiz.use(crearApp({ db, jwtSecret: SECRETO, enviador: correo.enviador, limites: { api: 100_000, login: 100_000 } }))

const puerto = Number(process.env.PORT ?? 3100)
raiz.listen(puerto, () => {
  console.log(`API de pruebas e2e en http://localhost:${puerto}/api`)
})
