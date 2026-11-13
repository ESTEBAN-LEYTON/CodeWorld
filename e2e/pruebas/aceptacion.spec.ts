import { expect, test } from '@playwright/test'
import {
  abrirDesafio, agregarBloque, API, DOS_AVANCES, ejecutar, entrarAlumno, entrarTutor, guardarPrograma, prepararAlumno, prepararDesafio,
  registrarAlumno, registrarYEntrarTutor, saltarRecorrido, saltarRecorridoSiAparece, ultimoCodigo, unico,
} from './ayudantes'

// Pruebas de aceptación del cliente: cada caso PA-xx verifica un requerimiento de la Tabla 8 del informe
// (ver docs/pruebas.md). Se ejecutan en computador, tableta y celular.

const esCelular = (nombre: string) => nombre === 'celular'

test.describe('Tutor', () => {
  test('PA-01 RF01, R6: entra con contraseña y código 2FA; un código incorrecto no da acceso', async ({ page }) => {
    const tutor = unico('tutor')
    await registrarYEntrarTutor(page, tutor)
    await expect(page.getByText('Mis alumnos')).toBeVisible()
    await saltarRecorridoSiAparece(page)
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()

    await page.getByText('Soy tutor').click()
    await page.getByLabel('Usuario').fill(tutor)
    await page.getByLabel('Contraseña').fill('clave123')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByText('Verificación en dos pasos').waitFor()
    const correcto = await ultimoCodigo(page)
    await page.getByLabel('Código').fill(correcto === '000000' ? '111111' : '000000')
    await page.getByRole('button', { name: 'Verificar' }).click()
    await expect(page.getByRole('alert')).toContainText('Código incorrecto. Te quedan 4 intentos')
    await expect(page.getByText('Mis alumnos')).toBeHidden()
    // R6: el reenvío del código espera 60 s
    await expect(page.getByRole('button', { name: /Reenviar código en \d+ s/ })).toBeDisabled()
  })

  test('PA-02 RF02, RF03, RNF04: registra un alumno con consentimiento y sin pedir datos personales', async ({ page }) => {
    await registrarYEntrarTutor(page, unico('tutor'))
    await saltarRecorridoSiAparece(page)
    await page.getByRole('button', { name: '+ Registrar alumno' }).click()
    await expect(page.getByLabel(/nombre real|apellido|correo|rut/i)).toHaveCount(0)

    // Sin marcar el consentimiento, el formulario no se envía.
    const alumno = unico('alumno')
    await page.getByLabel('Usuario del alumno').fill(alumno)
    await page.getByLabel('Clave').fill('gato123')
    await page.getByLabel('Edad').fill('11')
    await page.getByRole('button', { name: 'Registrar alumno', exact: true }).click()
    await expect(page.getByRole('cell', { name: alumno })).toHaveCount(0)

    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Registrar alumno', exact: true }).click()
    await expect(page.getByRole('cell', { name: alumno })).toBeVisible()
  })
})

test.describe('Alumno', () => {
  test('PA-03 RF04: entra con el usuario y la clave de su tutor; una clave incorrecta no da acceso', async ({ page }) => {
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno, 'clave-mala')
    await expect(page.getByRole('alert')).toContainText('incorrectos')
    await page.getByLabel('Clave').fill('gato123')
    await page.getByRole('button', { name: 'Entrar a jugar' }).click()
    await expect(page.getByText(`¡Hola, ${alumno}!`)).toBeVisible()
  })

  test('PA-04 RF05: ve los niveles y desafíos ordenados por dificultad', async ({ page }) => {
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await saltarRecorrido(page)
    await expect(page.locator('.tarjeta-nivel h3')).toHaveText(['Secuencias', 'Ciclos', 'Condiciones'])
    await expect(page.locator('.lista-desafios button')).toHaveCount(12)
  })

  test('PA-05 RF06, RF07, RF09: arma el programa con bloques, ve al robot llegar y gana XP', async ({ page }, info) => {
    test.skip(esCelular(info.project.name), 'En celular el arrastre táctil se verifica en la prueba manual PM-01')
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await agregarBloque(page)
    await agregarBloque(page)
    await ejecutar(page)
    await expect(page.locator('.feedback.ok')).toContainText('¡Lo lograste!')
    await expect(page.locator('.feedback.ok')).toContainText('+10 XP')
    await expect(page.locator('.xp')).toHaveText(/10 XP/)
    await expect(page.locator('.estado-sync')).toContainText('Progreso guardado')
  })

  test('PA-06 RF08: un error muestra una guía correctiva sin revelar la solución y no da XP', async ({ page }) => {
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await ejecutar(page)
    await expect(page.locator('.feedback')).toContainText('Tu programa está vacío')
    await expect(page.locator('.xp')).toHaveText(/ 0 XP/)
  })

  test('PA-07 RF11: el tutor consulta el progreso de su alumno', async ({ page }) => {
    const tutor = unico('tutor')
    const alumno = unico('alumno')
    await registrarYEntrarTutor(page, tutor)
    await registrarAlumno(page, alumno)
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()

    await entrarAlumno(page, alumno)
    await guardarPrograma(page, 'secuencias-1', DOS_AVANCES)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await ejecutar(page)
    await expect(page.locator('.feedback.ok')).toBeVisible()
    await expect(page.locator('.estado-sync')).toContainText('Progreso guardado')
    await page.getByRole('button', { name: 'Volver al menú' }).click()
    await page.getByRole('button', { name: 'Salir' }).click()

    await page.getByText('Soy tutor').click()
    await entrarTutor(page, tutor)
    await saltarRecorridoSiAparece(page)
    await page.getByRole('button', { name: 'Ver progreso' }).click()
    await expect(page.getByText(`Progreso de ${alumno}`)).toBeVisible()
    await expect(page.getByText('Primeros pasos')).toBeVisible()
  })
})

test.describe('Sin conexión y persistencia', () => {
  test('PA-08 RF10, R2, R7: sin internet la app abre, se resuelve el desafío y sincroniza al volver', async ({ page, context }) => {
    const { alumno, tokenTutor } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    // El service worker debe tener el control antes de cortar la conexión.
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    await guardarPrograma(page, 'secuencias-1', DOS_AVANCES)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByText('Sin conexión: estás jugando con los desafíos guardados')).toBeVisible()
    await page.getByRole('button', { name: /Primeros pasos/ }).click()
    await ejecutar(page)
    await expect(page.locator('.feedback.ok')).toContainText('¡Lo lograste!')
    await expect(page.locator('.estado-sync')).toContainText('por guardar')

    const xpServidor = async () => {
      const res = await page.request.get(`${API}/api/tutor/alumnos`, { headers: { Authorization: `Bearer ${tokenTutor}` } })
      return (await res.json())[0].xpTotal as number
    }
    expect(await xpServidor()).toBe(0)

    await context.setOffline(false)
    await expect(page.locator('.estado-sync')).toContainText('Progreso guardado')
    expect(await xpServidor()).toBe(10)
  })

  test('PA-09 R2: el programa a medio armar sobrevive a recargar la página', async ({ page }, info) => {
    test.skip(esCelular(info.project.name), 'En celular el arrastre táctil se verifica en la prueba manual PM-01')
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await agregarBloque(page)
    await page.reload()
    await page.getByRole('button', { name: /Primeros pasos/ }).click()
    await ejecutar(page)
    // Un solo «avanzar» guardado: el robot se mueve pero no alcanza la meta.
    await expect(page.locator('.feedback')).toContainText('Cuenta las casillas')
  })

  test('PA-14 RNF04: el navegador del alumno no contacta a terceros', async ({ page }) => {
    const externos: string[] = []
    page.on('request', (r) => {
      const { hostname, protocol } = new URL(r.url())
      if (protocol.startsWith('http') && hostname !== 'localhost') externos.push(r.url())
    })
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await ejecutar(page)
    await expect(page.locator('.feedback')).toBeVisible()
    expect(externos).toEqual([])
  })
})

test.describe('Requerimientos no funcionales', () => {
  test('PA-10 RNF01, RNF03: la retroalimentación tarda 300 ms o menos con la CPU 6 veces más lenta', async ({ page, context }) => {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 })
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await abrirDesafio(page, 'Primeros pasos')
    await prepararDesafio(page)
    await ejecutar(page)
    const medicion = await page.locator('.medicion').textContent()
    const ms = /<1 ms/.test(medicion!) ? 0 : Number(/(\d+) ms/.exec(medicion!)![1])
    test.info().annotations.push({ type: 'medicion', description: `${ms} ms` })
    expect(ms).toBeLessThanOrEqual(300)
  })

  test('PA-11 RNF05: un ciclo infinito se detiene a los 200 pasos y orienta al alumno', async ({ page }) => {
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await saltarRecorrido(page)
    await guardarPrograma(page, 'ciclos-2', {
      next: { block: { type: 'cw_repetir_hasta_meta', inputs: { CUERPO: { block: { type: 'cw_girar', fields: { SENTIDO: 'derecha' } } } } } },
    })
    await page.getByRole('button', { name: /Escalera/ }).click()
    await prepararDesafio(page)
    await ejecutar(page)
    await expect(page.locator('.feedback')).toContainText('da vueltas sin llegar', { timeout: 120_000 })
    await expect(page.locator('.medicion')).toContainText('200 pasos')
  })

  test('PA-12 RNF06: las opciones principales están a dos clics o menos y en español', async ({ page }) => {
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await saltarRecorrido(page)
    // Desde el menú, un clic abre cualquier desafío.
    await page.getByRole('button', { name: /Empezar a jugar/ }).click()
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('PA-13 RNF02: la interfaz se adapta a la pantalla sin desplazamiento horizontal', async ({ page }) => {
    const sinDesborde = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)
    const { alumno } = await prepararAlumno(page)
    await entrarAlumno(page, alumno)
    await saltarRecorrido(page)
    expect(await sinDesborde()).toBe(true)
    await page.getByRole('button', { name: /Primeros pasos/ }).click()
    await prepararDesafio(page)
    expect(await sinDesborde()).toBe(true)
    await expect(page.locator('.blocklyMainBackground')).toBeVisible()
  })

  test('PA-13b RNF02: el panel del tutor no se desborda con nombres de usuario largos', async ({ page }) => {
    await registrarYEntrarTutor(page, unico('tutor_nombre_largo'))
    await registrarAlumno(page, unico('alumno_nombre_largo'))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
    await page.getByRole('button', { name: 'Ver progreso' }).click()
    await expect(page.getByText(/^Progreso de /)).toBeVisible()
  })
})
