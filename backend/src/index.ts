import 'dotenv/config'
import { crearApp } from './app.js'
import { crearDb } from './db.js'

const puerto = Number(process.env.PORT ?? 3000)
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('Falta JWT_SECRET (ver backend/.env.example)')

crearApp({ db: crearDb(), jwtSecret }).listen(puerto, () => {
  console.log(`CodeWorld API escuchando en http://localhost:${puerto}/api`)
})
