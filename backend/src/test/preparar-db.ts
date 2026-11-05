import 'dotenv/config'
import { execSync } from 'node:child_process'

// Aplica las migraciones a la base de pruebas antes de ejecutar la suite.
export default function () {
  const url = process.env.TEST_DATABASE_URL
  if (!url) {
    console.warn('TEST_DATABASE_URL no está definida: se omiten las pruebas con PostgreSQL.')
    return
  }
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url }, stdio: 'ignore' })
}
