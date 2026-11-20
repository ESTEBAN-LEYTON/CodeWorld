import { expect, test } from '@playwright/test'
import { agregarBloque, ejecutar, prepararDesafio } from './ayudantes'

// TEMPORAL: flujo de la validación con cliente simulado (/validacion) y su página de resultados.

test('VAL-01: consentimiento, prueba de 3 desafíos, encuesta y resultados', async ({ page }, info) => {
  test.skip(info.project.name !== 'computador', 'El arrastre de bloques se automatiza solo en computador')

  await page.goto('/validacion')
  const comenzar = page.getByRole('button', { name: 'Comenzar la prueba' })
  await expect(comenzar).toBeEnabled()
  await page.getByLabel('Soy mayor de 18 años.').check()
  await page.getByLabel('Leí lo anterior y acepto participar.').check()
  await page.getByRole('radio', { name: 'Docente' }).check()
  await page.getByRole('radio', { name: 'Ninguna' }).check()
  await page.getByRole('radio', { name: 'Sí' }).check()
  await page.getByRole('radio', { name: 'Computador' }).check()
  await comenzar.click()

  // Desafío 1: primero un error (programa vacío) y después la solución.
  await expect(page.getByText('Desafío 1 de 3')).toBeVisible()
  await prepararDesafio(page)
  await ejecutar(page)
  await expect(page.locator('.feedback')).toContainText('Tu programa está vacío')
  await agregarBloque(page)
  await agregarBloque(page)
  await ejecutar(page)
  await expect(page.locator('.feedback.ok')).toContainText('¡Lo lograste!')
  await page.getByRole('button', { name: 'Siguiente desafío →' }).click()

  // Desafíos 2 y 3: el participante se rinde.
  await expect(page.getByText('Desafío 2 de 3')).toBeVisible()
  const probar = page.getByRole('button', { name: '¡A probarlo!' })
  if (await probar.isVisible().catch(() => false)) await probar.click()
  await page.getByRole('button', { name: 'No puedo: pasar' }).click()
  await expect(page.getByText('Desafío 3 de 3')).toBeVisible()
  if (await probar.isVisible().catch(() => false)) await probar.click()
  await page.getByRole('button', { name: 'No puedo: terminar' }).click()

  // Encuesta.
  await expect(page.getByRole('heading', { name: 'Encuesta' })).toBeVisible()
  await page.getByRole('radio', { name: 'No', exact: true }).check()
  for (const grupo of await page.locator('fieldset.escala').all()) await grupo.getByRole('radio', { name: '4' }).check()
  await page.getByLabel('¿Qué fue lo más difícil o confuso?').fill('Encontrar el bloque de girar')
  await page.getByRole('button', { name: 'Enviar respuestas' }).click()
  await expect(page.getByText('¡Gracias por participar!')).toBeVisible()
  const codigo = (await page.locator('.codigo-participante').textContent())!
  expect(codigo).toMatch(/^P-[A-Z2-9]{4}$/)

  // Resultados con la clave.
  await page.goto('/validacion/resultados')
  await page.getByLabel('Clave').fill('clave-de-validacion-de-pruebas')
  await page.getByRole('button', { name: 'Ver resultados' }).click()
  await expect(page.getByRole('heading', { name: 'Resultados de la validación' })).toBeVisible()
  await expect(page.getByRole('row', { name: /Resuelve el primer desafío sin ayuda externa/ })).toContainText('100% (1 de 1)')
  await expect(page.getByRole('row', { name: /Resuelve los 3 desafíos/ })).toContainText('0% (0 de 1)')
  await expect(page.getByRole('row', { name: /Corrige después de una pista/ })).toContainText('100% (1 de 1)')
  await expect(page.getByText(`${codigo}: Encontrar el bloque de girar`)).toBeVisible()
})
