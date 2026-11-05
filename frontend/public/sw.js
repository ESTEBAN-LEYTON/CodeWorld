// Service worker: permite abrir CodeWorld sin conexión (riesgos R2 y R7 del informe).
// La página se pide primero a la red para recibir versiones nuevas; los archivos con hash no cambian
// y se sirven desde la caché. La API nunca pasa por aquí: el progreso lo maneja GestorProgreso.

const CACHE = 'codeworld-v1'
const INICIO = '/'
const FIJOS = [
  '/favicon.svg',
  ...['sprites.svg', 'handopen.cur', 'handclosed.cur', 'handdelete.cur', 'dropdown-arrow.svg', 'click.mp3', 'delete.mp3', 'disconnect.mp3'].map(
    (a) => `/blockly-media/${a}`,
  ),
]

async function precargar() {
  const cache = await caches.open(CACHE)
  const pagina = await fetch(INICIO, { cache: 'no-store' })
  const html = await pagina.clone().text()
  // Los nombres de los archivos de Vite llevan un hash: se leen desde el propio index.html.
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
  await cache.put(INICIO, pagina)
  await cache.addAll([...assets, ...FIJOS])
}

async function limpiarAntiguas() {
  const claves = await caches.keys()
  await Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))
  await self.clients.claim()
}

async function paginaRedPrimero(request) {
  const cache = await caches.open(CACHE)
  try {
    const respuesta = await fetch(request)
    if (respuesta.ok) await cache.put(INICIO, respuesta.clone())
    return respuesta
  } catch {
    const guardada = await cache.match(INICIO)
    if (guardada) return guardada
    throw new Error('Sin conexión y sin copia guardada de la página')
  }
}

async function archivoCachePrimero(request) {
  const cache = await caches.open(CACHE)
  // Vite pide sus archivos con CORS; con «Vary: Origin» no coincidirían con la copia precargada.
  const guardado = await cache.match(request, { ignoreVary: true })
  if (guardado) return guardado
  const respuesta = await fetch(request)
  if (respuesta.ok) await cache.put(request, respuesta.clone())
  return respuesta
}

self.addEventListener('install', (e) => {
  e.waitUntil(precargar().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(limpiarAntiguas())
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api')) return
  e.respondWith(e.request.mode === 'navigate' ? paginaRedPrimero(e.request) : archivoCachePrimero(e.request))
})
