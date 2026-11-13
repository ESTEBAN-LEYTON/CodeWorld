import { chromium } from '@playwright/test'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Convierte los SVG de docs/diagramas/fuente/svg en PNG de 1920x1080 y avisa si un texto se sale de su caja.

const raiz = resolve(import.meta.dirname, '../docs/diagramas')
const carpeta = join(raiz, 'fuente/svg')
const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } })
let problemas = 0

for (const archivo of readdirSync(carpeta).filter((a) => a.endsWith('.svg')).sort()) {
  await pagina.setContent(`<!doctype html><html><body style="margin:0">${readFileSync(join(carpeta, archivo), 'utf8')}</body></html>`)
  await pagina.evaluate(() => document.fonts.ready)
  const fuera = await pagina.evaluate(() =>
    [...document.querySelectorAll('text')].filter((t) => t.textContent.trim()).flatMap((t) => {
      const b = t.getBBox()
      const margen = 6
      const fueraDelLienzo = b.x < 0 || b.y < 0 || b.x + b.width > 1920 || b.y + b.height > 1080
      const caja = t.dataset.caja?.split(',').map(Number)
      const fueraDeCaja = caja && (b.x < caja[0] + margen || b.x + b.width > caja[0] + caja[2] - margen || b.y < caja[1] || b.y + b.height > caja[1] + caja[3])
      return fueraDelLienzo || fueraDeCaja ? [t.textContent] : []
    }),
  )
  for (const t of fuera) {
    problemas++
    console.log(`  ${archivo}: se sale «${t}»`)
  }
  await pagina.screenshot({ path: join(raiz, archivo.replace('.svg', '.png')) })
  console.log(archivo.replace('.svg', '.png'))
}
await navegador.close()
if (problemas) {
  console.log(`${problemas} textos fuera de su caja`)
  process.exit(1)
}
