import type { Page } from '@playwright/test'

export const API = 'http://localhost:3100'

let contador = 0
/** Nombre único entre proyectos y ejecuciones: la base solo se vacía al iniciar el servidor. */
export const unico = (prefijo: string) => `${prefijo}_${Date.now().toString(36)}${(contador++).toString(36)}`

export async function ultimoCodigo(page: Page): Promise<string> {
  const res = await page.request.get(`${API}/__e2e/codigo`)
  return (await res.json()).codigo
}

export async function registrarYEntrarTutor(page: Page, tutor: string, clave = 'clave123') {
  await page.goto('/')
  await page.getByText('Soy tutor').click()
  await page.getByText('Crear cuenta de tutor').click()
  await page.getByLabel('Usuario').fill(tutor)
  await page.getByLabel(/^Correo/).fill(`${tutor}@correo.cl`)
  await page.getByLabel('Contraseña', { exact: true }).fill(clave)
  await page.getByLabel('Repite la contraseña').fill(clave)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await page.getByText('Cuenta creada').waitFor()
  await entrarTutor(page, tutor, clave)
}

export async function entrarTutor(page: Page, tutor: string, clave = 'clave123') {
  await page.getByLabel('Usuario').fill(tutor)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByText('Verificación en dos pasos').waitFor()
  await page.getByLabel('Código').fill(await ultimoCodigo(page))
  await page.getByRole('button', { name: 'Verificar' }).click()
  await page.getByText('Mis alumnos').waitFor()
}

export async function saltarRecorrido(page: Page) {
  const saltar = page.getByRole('button', { name: 'Saltar' })
  await saltar.waitFor()
  await saltar.click()
}

export async function registrarAlumno(page: Page, alumno: string, clave = 'gato123', edad = '11') {
  await saltarRecorridoSiAparece(page)
  await page.getByRole('button', { name: '+ Registrar alumno' }).click()
  await page.getByLabel('Usuario del alumno').fill(alumno)
  await page.getByLabel('Clave').fill(clave)
  await page.getByLabel('Edad').fill(edad)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Registrar alumno', exact: true }).click()
  await page.getByRole('cell', { name: alumno }).waitFor()
}

export async function saltarRecorridoSiAparece(page: Page) {
  const saltar = page.getByRole('button', { name: 'Saltar' })
  if (await saltar.isVisible().catch(() => false)) await saltar.click()
}

/** Crea por la API un tutor con un alumno, para las pruebas que empiezan desde la sesión del alumno. */
export async function prepararAlumno(page: Page) {
  const tutor = unico('tutor')
  const alumno = unico('alumno')
  const post = (ruta: string, data: object, token?: string) =>
    page.request.post(`${API}/api${ruta}`, { data, headers: token ? { Authorization: `Bearer ${token}` } : {} })
  await post('/auth/tutor/registro', { username: tutor, password: 'clave123', contacto: `${tutor}@correo.cl` })
  const { desafio2fa } = await (await post('/auth/tutor/login', { username: tutor, password: 'clave123' })).json()
  const { token } = await (await post('/auth/tutor/verificar', { desafio2fa, codigo: await ultimoCodigo(page) })).json()
  await post('/alumnos', { username: alumno, password: 'gato123', edad: 11, consentimiento: true }, token)
  return { tutor, alumno, tokenTutor: token as string }
}

export async function entrarAlumno(page: Page, alumno: string, clave = 'gato123') {
  await page.goto('/')
  await page.getByText('Soy alumno').click()
  await page.getByLabel('Usuario').fill(alumno)
  await page.getByLabel('Clave').fill(clave)
  await page.getByRole('button', { name: 'Entrar a jugar' }).click()
}

export async function abrirDesafio(page: Page, titulo: string) {
  await saltarRecorrido(page)
  await page.getByRole('button', { name: new RegExp(titulo) }).click()
}

/** Cierra el tutorial del desafío y la explicación de bloques nuevos, si aparecen. */
export async function prepararDesafio(page: Page) {
  await saltarRecorrido(page)
  const probar = page.getByRole('button', { name: '¡A probarlo!' })
  await probar.waitFor()
  await probar.click()
  await page.locator('.blocklyWorkspace').first().waitFor()
}

/** Arrastra el primer bloque de la caja de herramientas y lo encaja al final del programa. */
export async function agregarBloque(page: Page) {
  const fuente = page.locator('.blocklyFlyout .blocklyDraggable').first()
  await fuente.waitFor()
  const origen = (await fuente.boundingBox())!
  // El punto de encaje es justo bajo el último bloque del lienzo principal.
  const destino = await page.evaluate(() => {
    const lienzo = document.querySelector('.blocklySvg .blocklyWorkspace > .blocklyBlockCanvas')
    const grupos = lienzo ? [...lienzo.querySelectorAll('.blocklyDraggable')] : []
    const cajas = grupos.map((g) => g.getBoundingClientRect())
    const abajo = Math.max(...cajas.map((c) => c.bottom))
    const izquierda = Math.min(...cajas.map((c) => c.left))
    return { x: izquierda, y: abajo }
  })
  const agarre = { x: origen.x + 12, y: origen.y + origen.height / 2 }
  await page.mouse.move(agarre.x, agarre.y)
  await page.mouse.down()
  await page.mouse.move(agarre.x + 40, agarre.y + 10, { steps: 4 })
  await page.mouse.move(destino.x + 12, destino.y + origen.height / 2 + 2, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(250)
}

/**
 * Deja un programa exacto en el autoguardado del alumno con sesión iniciada, sin arrastrar bloques.
 * Debe llamarse antes de abrir el desafío, porque el editor lo lee al crearse.
 */
export async function guardarPrograma(page: Page, desafioId: string, bloques: object) {
  const handle = await page.waitForFunction(() => {
    const sesion = localStorage.getItem('codeworld.sesion')
    return sesion && (JSON.parse(sesion).alumnoId as string)
  })
  const alumnoId = await handle.jsonValue()
  const programa = { blocks: { languageVersion: 0, blocks: [{ type: 'cw_al_ejecutar', x: 30, y: 30, deletable: false, ...bloques }] } }
  await page.evaluate(([clave, valor]) => localStorage.setItem(clave, valor), [`codeworld.programa.${alumnoId}.${desafioId}`, JSON.stringify(programa)])
}

export const DOS_AVANCES = { next: { block: { type: 'cw_avanzar', next: { block: { type: 'cw_avanzar' } } } } }

export async function ejecutar(page: Page) {
  await page.getByRole('button', { name: '▶ Ejecutar' }).click()
}
