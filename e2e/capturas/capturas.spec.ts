import { test } from '@playwright/test'
import { agregarBloque, ejecutar, entrarAlumno, entrarTutor, registrarYEntrarTutor, saltarRecorrido, unico } from '../pruebas/ayudantes'

// Capturas reales del sistema para el informe. No forman parte de la suite de aceptación.
const ruta = (n: string) => `../docs/capturas/${n}.png`

test('capturas del sistema', async ({ page, browser }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.screenshot({ path: ruta('01-inicio') })

  const tutor = unico('tutor')
  const alumno = 'gato_rapido'
  await registrarYEntrarTutor(page, tutor)
  await page.getByRole('button', { name: 'Saltar' }).click().catch(() => {})
  await page.getByRole('button', { name: '+ Registrar alumno' }).click()
  await page.getByLabel('Usuario del alumno').fill(alumno)
  await page.getByLabel('Clave').fill('gato123')
  await page.getByLabel('Edad').fill('11')
  await page.getByRole('checkbox').check()
  await page.screenshot({ path: ruta('02-registro-alumno') })
  await page.getByRole('button', { name: 'Registrar alumno', exact: true }).click()
  await page.getByRole('cell', { name: alumno }).waitFor()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()

  await entrarAlumno(page, alumno)
  await page.locator('.tarjeta-recorrido').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: ruta('03-recorrido') })
  await saltarRecorrido(page)
  await page.screenshot({ path: ruta('04-menu') })

  await page.getByRole('button', { name: /Primeros pasos/ }).click()
  await saltarRecorrido(page)
  await page.locator('.modal').waitFor()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: ruta('05-bloque-nuevo') })
  await page.getByRole('button', { name: '¡A probarlo!' }).click()
  await page.waitForTimeout(300)
  await ejecutar(page)
  await page.locator('.feedback').waitFor()
  await page.screenshot({ path: ruta('06-guia-correctiva') })

  await agregarBloque(page)
  await agregarBloque(page)
  await ejecutar(page)
  await page.locator('.feedback.ok').waitFor()
  await page.locator('.estado-sync.sincronizado').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: ruta('07-exito') })
  await page.getByRole('button', { name: 'Salir' }).click()

  await page.getByText('Soy tutor').click()
  await entrarTutor(page, tutor)
  await page.getByRole('button', { name: 'Ver progreso' }).click()
  await page.getByText(`Progreso de ${alumno}`).waitFor()
  await page.screenshot({ path: ruta('08-panel-tutor') })

  const movil = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, baseURL: 'http://localhost:4173' })
  await entrarAlumno(movil, alumno)
  await saltarRecorrido(movil)
  await movil.screenshot({ path: ruta('09-celular') })
  await movil.close()
})
