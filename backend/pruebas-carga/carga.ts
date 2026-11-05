import 'dotenv/config'
import { spawn, execSync } from 'node:child_process'
import { openSync, writeFileSync } from 'node:fs'
import { cpus, totalmem } from 'node:os'
import autocannon from 'autocannon'
import { crearDb } from '../src/db.js'
import { Tokens } from '../src/seguridad/tokens.js'
import { hashear } from '../src/seguridad/contrasenas.js'
import { reiniciarDb, SECRETO, urlPruebas } from '../src/test/utilidades.js'

// Prueba de cargabilidad: ejecuta el build de producción contra la base de pruebas (que VACÍA) y mide
// cada endpoint que usa una clase con 10, 50 y 100 conexiones simultáneas. El rate limiting se relaja
// para medir la capacidad del sistema y no el límite; su efecto se verifica en las pruebas de la API.
// La API no ejecuta código del alumno, así que estos endpoints son toda su carga en una clase.

if (!urlPruebas) throw new Error('La prueba de carga necesita TEST_DATABASE_URL')

const PUERTO = 3200
const SEGUNDOS = 15
const CONEXIONES = [10, 50, 100]
const BASE = `http://localhost:${PUERTO}`

// Criterios definidos antes de medir (docs/pruebas.md).
const CRITERIO_P97_MS = 1000
const CRITERIO_ERRORES = 0

execSync('npm run build', { stdio: 'ignore' })
execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: urlPruebas }, stdio: 'ignore' })

const db = crearDb(urlPruebas)
await reiniciarDb(db)
const tutor = await db.tutor.create({
  data: { username: 'tutor_carga', passwordHash: await hashear('clave123'), contactoVerificado: 'carga@correo.cl' },
})
const alumno = await db.alumno.create({
  data: { tutorId: tutor.id, username: 'alumno_carga', passwordHash: await hashear('gato123'), edad: 11 },
})
const tokenAlumno = new Tokens(SECRETO).firmarSesion({ sub: alumno.id, rol: 'alumno' })

const servidor = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PUERTO),
    DATABASE_URL: urlPruebas,
    JWT_SECRET: SECRETO,
    LIMITE_API: '100000000',
    LIMITE_LOGIN: '100000000',
    BREVO_API_KEY: '',
  },
  // Los errores del servidor quedan aquí para poder diagnosticar un resultado «No cumple».
  stdio: ['ignore', 'ignore', openSync(new URL('./servidor.log', import.meta.url), 'w')],
})

async function esperarServidor() {
  for (let i = 0; i < 50; i++) {
    const ok = await fetch(`${BASE}/api/health`).then((r) => r.ok).catch(() => false)
    if (ok) return
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('El servidor no respondió')
}

const json = { 'Content-Type': 'application/json' }
const ESCENARIOS: { nombre: string; ruta: string; opciones?: Partial<autocannon.Options> }[] = [
  { nombre: 'GET /api/health', ruta: '/api/health' },
  { nombre: 'GET /api/niveles (contenido)', ruta: '/api/niveles' },
  {
    nombre: 'POST /api/auth/alumno/login',
    ruta: '/api/auth/alumno/login',
    opciones: { method: 'POST', headers: json, body: JSON.stringify({ username: 'alumno_carga', password: 'gato123' }) },
  },
  {
    nombre: 'POST /api/progreso/sincronizar',
    ruta: '/api/progreso/sincronizar',
    opciones: {
      method: 'POST',
      headers: { ...json, Authorization: `Bearer ${tokenAlumno}` },
      body: JSON.stringify({
        registros: ['secuencias-1', 'secuencias-2'].map((desafioId) => ({ desafioId, completadoEn: '2026-11-05T15:00:00Z', intentos: 2 })),
      }),
    },
  },
]

interface Fila {
  escenario: string
  conexiones: number
  rps: number
  p50: number
  p97: number
  p99: number
  max: number
  errores: number
  cumple: boolean
}

const filas: Fila[] = []
try {
  await esperarServidor()
  for (const { nombre, ruta, opciones } of ESCENARIOS) {
    for (const connections of CONEXIONES) {
      const r = await autocannon({ url: `${BASE}${ruta}`, connections, duration: SEGUNDOS, ...opciones })
      // Una respuesta 404 o 429 es muy rápida: sin esto, una ruta mal escrita parecería un gran rendimiento.
      if (r['2xx'] === 0) throw new Error(`${nombre}: ninguna respuesta exitosa, la medición no es válida`)
      const errores = r.errors + r.timeouts + r.non2xx
      const fila: Fila = {
        escenario: nombre,
        conexiones: connections,
        rps: Math.round(r.requests.average),
        p50: r.latency.p50,
        p97: r.latency.p97_5,
        p99: r.latency.p99,
        max: r.latency.max,
        errores,
        cumple: r.latency.p97_5 <= CRITERIO_P97_MS && errores <= CRITERIO_ERRORES,
      }
      filas.push(fila)
      console.log(fila, r.statusCodeStats)
    }
  }
} finally {
  servidor.kill()
  await db.$disconnect()
}

const tabla = filas
  .map((f) => `| ${f.escenario} | ${f.conexiones} | ${f.rps} | ${f.p50} | ${f.p97} | ${f.p99} | ${f.max} | ${f.errores} | ${f.cumple ? 'Cumple' : 'No cumple'} |`)
  .join('\n')

writeFileSync(
  new URL('../../docs/pruebas/resultados-carga.md', import.meta.url),
  `# Resultados de la prueba de carga

Generado por \`npm run test:carga\` el ${new Date().toISOString().slice(0, 10)}.

- **Entorno:** computador local, ${cpus().length} núcleos, ${Math.round(totalmem() / 2 ** 30)} GB de RAM. API (Node.js), PostgreSQL 17 y generador de carga en la misma máquina. **No mide el hosting definitivo.**
- **Duración:** ${SEGUNDOS} s por combinación.
- **Criterio:** percentil 97,5 de ${CRITERIO_P97_MS} ms o menos y ${CRITERIO_ERRORES} errores.

| Escenario | Conexiones | Pet./s | p50 (ms) | p97,5 (ms) | p99 (ms) | Máx. (ms) | Errores | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${tabla}
`,
)
process.exit(filas.every((f) => f.cumple) ? 0 : 1)
