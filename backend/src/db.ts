import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

export type Db = PrismaClient

export function crearDb(url = process.env.DATABASE_URL): Db {
  if (!url) throw new Error('Falta DATABASE_URL (ver backend/.env.example)')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}
