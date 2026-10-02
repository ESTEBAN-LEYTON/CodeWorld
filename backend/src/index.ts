import 'dotenv/config'
import { crearApp } from './app.js'

const puerto = Number(process.env.PORT ?? 3000)

crearApp().listen(puerto, () => {
  console.log(`CodeWorld API escuchando en http://localhost:${puerto}`)
})
