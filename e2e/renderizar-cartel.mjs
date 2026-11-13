import { chromium } from '@playwright/test'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Convierte docs/expotic/cartel.html en el PDF de 90 x 120 cm que pide EXPOTIC.
// Avisa si algo se sale del cartel y cuántos datos quedan por completar (marcas amarillas).

const carpeta = resolve(import.meta.dirname, '../docs/expotic')
const salida = resolve(carpeta, 'Cartel_E_Leyton_Miranda_2026.pdf')
const MM = 96 / 25.4

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: Math.round(900 * MM), height: Math.round(1200 * MM) } })
await pagina.goto(pathToFileURL(resolve(carpeta, 'cartel.html')).href)
await pagina.evaluate(() => document.fonts.ready)

const revision = await pagina.evaluate(() => {
  const desbordes = []
  const altoPagina = document.documentElement.clientHeight
  if (document.documentElement.scrollHeight > altoPagina + 1) desbordes.push(`la página mide ${document.documentElement.scrollHeight}px de ${altoPagina}px`)
  for (const el of document.querySelectorAll('main .col, section, .in')) {
    if (el.scrollHeight > el.clientHeight + 1) desbordes.push(`${el.className || el.tagName}: ${el.querySelector('h2')?.textContent ?? ''} (${el.scrollHeight - el.clientHeight}px)`)
  }
  const main = document.querySelector('main').getBoundingClientRect()
  for (const col of document.querySelectorAll('main .col')) {
    const ultima = col.lastElementChild.getBoundingClientRect()
    if (ultima.bottom > main.bottom + 1) desbordes.push(`columna se pasa ${Math.round(ultima.bottom - main.bottom)}px`)
  }
  const sobra = [...document.querySelectorAll('main .col')].map((c) => Math.round(c.getBoundingClientRect().bottom - c.lastElementChild.getBoundingClientRect().bottom))
  return { desbordes, sobra, pendientes: document.querySelectorAll('.pendiente').length }
})

await pagina.pdf({ path: salida, width: '900mm', height: '1200mm', printBackground: true, pageRanges: '1' })
await navegador.close()

console.log(salida)
console.log(`Espacio libre al pie de cada columna (px): ${revision.sobra.join(', ')}`)
if (revision.pendientes) console.log(`${revision.pendientes} datos por completar (marcas amarillas)`)
if (revision.desbordes.length) {
  console.log('Se sale del cartel:\n  ' + revision.desbordes.join('\n  '))
  process.exit(1)
}
