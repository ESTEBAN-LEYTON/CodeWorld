import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { llamar, mensajeDeError } from '../api'
import { Logo } from '../components/Robot'
import { cargarNiveles } from '../game/contenido'
import type { Desafio, Nivel, PatronError } from '../game/types'
import { PantallaDesafio } from './Juego'

// TEMPORAL (validación con cliente simulado, noviembre de 2026). Se abre en /validacion.
// Consentimiento → prueba con 3 desafíos reales → encuesta. Las respuestas son anónimas:
// no se piden nombres, correos ni datos de menores. Para quitarlo, ver docs/validacion.md.

/** Desafíos de la prueba: [orden del nivel, orden del desafío]. */
const PRUEBA: [number, number][] = [
  [1, 1],
  [1, 2],
  [2, 1],
]

export const LIKERT: { id: string; texto: string; objetivo: string; noAplica?: boolean }[] = [
  { id: 'C1', texto: 'Entendí rápido qué tenía que hacer.', objetivo: 'OE1' },
  { id: 'C2', texto: 'El tutorial inicial fue suficiente para empezar.', objetivo: 'OE1' },
  { id: 'C3', texto: 'Los textos y botones se entienden para un niño de 9 a 15 años.', objetivo: 'OE1' },
  { id: 'C4', texto: 'Armar el programa con bloques fue intuitivo.', objetivo: 'OE2' },
  { id: 'C5', texto: 'La aplicación funcionó bien en mi dispositivo.', objetivo: 'OE2' },
  { id: 'C6', texto: 'Cuando me equivoqué, la pista me ayudó a corregir sin darme la respuesta.', objetivo: 'OE3', noAplica: true },
  { id: 'C7', texto: 'La pista apareció de inmediato.', objetivo: 'OE3', noAplica: true },
  { id: 'C8', texto: 'Un niño de 9 a 15 años podría resolver estos desafíos sin ayuda de un adulto.', objetivo: 'OE4' },
  { id: 'C9', texto: 'Usaría CodeWorld con niños de 9 a 15 años.', objetivo: 'General' },
]

export const ABIERTAS: { id: string; texto: string }[] = [
  { id: 'D1', texto: '¿Qué fue lo más difícil o confuso?' },
  { id: 'D2', texto: '¿Hubo alguna pista que no entendiste o que no te ayudó? ¿Cuál?' },
  { id: 'D3', texto: '¿Qué cambiarías antes de usarla con niños de 9 a 15 años?' },
  { id: 'D4', texto: '¿Algo más que quieras comentar?' },
]

interface RegistroDesafio {
  id: string
  titulo: string
  resuelto: boolean
  intentos: number
  patrones: PatronError[]
  msHastaPrimeraEjecucion: number | null
  msHastaResolver: number | null
}

type Perfil = {
  rol: 'docente' | 'apoderado' | 'estudiante' | 'otro'
  experiencia: 'ninguna' | 'basica' | 'avanzada'
  trabajaConNinos: boolean
  dispositivo: 'computador' | 'tableta' | 'celular'
  navegador: string
}

function detectarDispositivo(): Perfil['dispositivo'] {
  const ancho = Math.min(window.screen.width, window.screen.height)
  if (ancho < 600) return 'celular'
  if (ancho < 1000 && navigator.maxTouchPoints > 0) return 'tableta'
  return 'computador'
}

function detectarNavegador() {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Otro'
}

export function Validacion() {
  const [paso, setPaso] = useState<'consentimiento' | 'prueba' | 'encuesta' | 'listo'>('consentimiento')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [niveles, setNiveles] = useState<Nivel[] | null>(null)
  const [errorCarga, setErrorCarga] = useState('')
  const [registros, setRegistros] = useState<RegistroDesafio[]>([])
  const [msTotal, setMsTotal] = useState(0)
  const [codigo, setCodigo] = useState('')
  const inicio = useRef(0)

  useEffect(() => {
    cargarNiveles()
      .then((c) => setNiveles(c.niveles))
      .catch((e) => setErrorCarga(mensajeDeError(e)))
  }, [])

  const desafios = useMemo(
    () =>
      PRUEBA.map(([n, d]) => niveles?.find((x) => x.orden === n)?.desafios.find((x) => x.orden === d)).filter(
        (d): d is Desafio => !!d,
      ),
    [niveles],
  )

  if (errorCarga) {
    return (
      <main className="centrado">
        <div className="tarjeta formulario">
          <h1>No pudimos cargar la prueba</h1>
          <p>{errorCarga} Revisa la conexión e intenta de nuevo.</p>
          <button className="primario" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  if (paso === 'consentimiento') {
    return (
      <Consentimiento
        listo={desafios.length === PRUEBA.length}
        onAceptar={(p) => {
          setPerfil(p)
          inicio.current = performance.now()
          setPaso('prueba')
        }}
      />
    )
  }

  if (paso === 'prueba') {
    return (
      <Prueba
        desafios={desafios}
        niveles={niveles ?? []}
        inicio={inicio.current}
        onTerminar={(r) => {
          setRegistros(r)
          setMsTotal(Math.round(performance.now() - inicio.current))
          setPaso('encuesta')
        }}
      />
    )
  }

  if (paso === 'encuesta') {
    return (
      <Encuesta
        onEnviar={async (encuesta) => {
          const res = await llamar<{ codigo: string }>('/validacion', {
            metodo: 'POST',
            cuerpo: { version: 1, perfil, desafios: registros, msTotal, ...encuesta },
          })
          setCodigo(res.codigo)
          setPaso('listo')
        }}
      />
    )
  }

  return (
    <main className="centrado">
      <div className="tarjeta formulario">
        <Logo />
        <h1>¡Gracias por participar!</h1>
        <p>Tus respuestas quedaron guardadas de forma anónima.</p>
        <p>
          Tu código de participante es <strong className="codigo-participante">{codigo}</strong>. Muéstraselo a quien
          te acompaña.
        </p>
      </div>
    </main>
  )
}

function Consentimiento({ listo, onAceptar }: { listo: boolean; onAceptar: (p: Perfil) => void }) {
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    onAceptar({
      rol: d.get('rol') as Perfil['rol'],
      experiencia: d.get('experiencia') as Perfil['experiencia'],
      trabajaConNinos: d.get('ninos') === 'si',
      dispositivo: d.get('dispositivo') as Perfil['dispositivo'],
      navegador: detectarNavegador(),
    })
  }

  return (
    <main className="centrado">
      <form className="tarjeta formulario validacion" onSubmit={enviar}>
        <Logo />
        <h1>Evaluación de CodeWorld</h1>
        <p className="subtitulo">
          CodeWorld es una plataforma para que jóvenes de 9 a 15 años aprendan a programar con bloques. Es parte del
          trabajo de título de Esteban Leyton (Ingeniería en Computación e Informática).
        </p>
        <div className="caja-consentimiento">
          <p>
            <strong>Qué harás (unos 15 minutos):</strong> resolver 3 desafíos cortos y responder una encuesta. Piensa
            en cómo los viviría un niño de 9 a 15 años.
          </p>
          <p>
            <strong>Qué se guarda:</strong> tus respuestas, los tiempos y los intentos de cada desafío, de forma
            anónima. No se guarda tu nombre, tu correo ni tu dirección IP. Los datos solo se usarán en el informe del
            trabajo de título.
          </p>
          <p>
            <strong>Tu participación es voluntaria:</strong> puedes detenerte cuando quieras cerrando esta página; si lo
            haces antes del final, no se guarda nada.
          </p>
        </div>
        <label className="consentimiento">
          <input type="checkbox" name="mayor" required />
          <span>Soy mayor de 18 años.</span>
        </label>
        <label className="consentimiento">
          <input type="checkbox" name="acepto" required />
          <span>Leí lo anterior y acepto participar.</span>
        </label>
        <Opciones
          nombre="rol"
          pregunta="¿Cuál es tu rol?"
          opciones={[
            ['docente', 'Docente'],
            ['apoderado', 'Apoderado'],
            ['estudiante', 'Estudiante'],
            ['otro', 'Otro'],
          ]}
        />
        <Opciones
          nombre="experiencia"
          pregunta="¿Qué experiencia tienes en programación?"
          opciones={[
            ['ninguna', 'Ninguna'],
            ['basica', 'Básica'],
            ['avanzada', 'Avanzada'],
          ]}
        />
        <Opciones
          nombre="ninos"
          pregunta="¿Trabajas o convives con niños de 9 a 15 años?"
          opciones={[
            ['si', 'Sí'],
            ['no', 'No'],
          ]}
        />
        <Opciones
          nombre="dispositivo"
          pregunta="¿En qué dispositivo estás?"
          inicial={detectarDispositivo()}
          opciones={[
            ['computador', 'Computador'],
            ['tableta', 'Tableta'],
            ['celular', 'Celular'],
          ]}
        />
        <button className="primario" type="submit" disabled={!listo}>
          {listo ? 'Comenzar la prueba' : 'Cargando…'}
        </button>
      </form>
    </main>
  )
}

function Opciones({ nombre, pregunta, opciones, inicial }: { nombre: string; pregunta: string; opciones: [string, string][]; inicial?: string }) {
  return (
    <fieldset className="pregunta">
      <legend>{pregunta}</legend>
      <div className="opciones-fila">
        {opciones.map(([valor, texto]) => (
          <label key={valor} className="opcion-radio">
            <input type="radio" name={nombre} value={valor} defaultChecked={valor === inicial} required />
            <span>{texto}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Prueba({
  desafios,
  niveles,
  inicio,
  onTerminar,
}: {
  desafios: Desafio[]
  niveles: Nivel[]
  inicio: number
  onTerminar: (r: RegistroDesafio[]) => void
}) {
  const [indice, setIndice] = useState(0)
  const registros = useRef<RegistroDesafio[]>(
    desafios.map((d) => ({
      id: d.id,
      titulo: d.titulo,
      resuelto: false,
      intentos: 0,
      patrones: [],
      msHastaPrimeraEjecucion: null,
      msHastaResolver: null,
    })),
  )
  const desafio = desafios[indice]
  const registro = registros.current[indice]
  const ultimo = indice === desafios.length - 1
  // Cada desafío se cronometra desde que aparece; el primero, desde que se aceptó el consentimiento.
  const abierto = useRef(inicio)
  // Una persona "ve" un bloque la primera vez que aparece en la prueba (como en el juego).
  const nuevos = useMemo(() => {
    const vistos = new Set(desafios.slice(0, indice).flatMap((d) => d.bloquesPermitidos))
    return desafio.bloquesPermitidos.filter((b) => !vistos.has(b))
  }, [desafios, indice, desafio])
  const nivel = niveles.find((n) => n.desafios.some((d) => d.id === desafio.id))!

  const avanzar = () => {
    if (ultimo) return onTerminar(registros.current)
    abierto.current = performance.now()
    setIndice(indice + 1)
  }

  return (
    <div className="app">
      <header className="barra">
        <Logo />
        <span className="espacio" />
        <span className="progreso-validacion">
          Desafío {indice + 1} de {desafios.length}
        </span>
        <button onClick={avanzar} title="Pasar al siguiente sin resolverlo">
          {ultimo ? 'No pude resolverlo: terminar' : 'No puedo resolverlo: pasar'}
        </button>
      </header>
      <PantallaDesafio
        key={desafio.id}
        alumnoId={`validacion-${Math.round(inicio)}`}
        desafio={desafio}
        nivel={nivel}
        siguiente={null}
        nuevos={nuevos}
        mostrarRecorrido={indice === 0}
        onRecorridoVisto={() => {}}
        onBloquesVistos={() => {}}
        onIr={() => {}}
        onMenu={avanzar}
        textoMenu={ultimo ? 'Terminar y responder la encuesta →' : 'Siguiente desafío →'}
        onResultado={(r) => {
          const ms = Math.round(performance.now() - abierto.current)
          registro.intentos++
          registro.msHastaPrimeraEjecucion ??= ms
          if (r.patronError) registro.patrones.push(r.patronError)
          if (r.estado === 'EXITO' && !registro.resuelto) {
            registro.resuelto = true
            registro.msHastaResolver = ms
          }
        }}
      />
    </div>
  )
}

function Encuesta({ onEnviar }: { onEnviar: (e: { ayudaExterna: string; likert: Record<string, number | null>; abiertas: Record<string, string> }) => Promise<void> }) {
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const likert = Object.fromEntries(LIKERT.map(({ id }) => [id, d.get(id) === 'na' ? null : Number(d.get(id))]))
    const abiertas = Object.fromEntries(ABIERTAS.map(({ id }) => [id, String(d.get(id) ?? '').trim()]))
    setError('')
    setEnviando(true)
    try {
      await onEnviar({ ayudaExterna: String(d.get('ayuda')), likert, abiertas })
    } catch (err) {
      setError(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <main className="centrado">
      <form className="tarjeta formulario validacion encuesta" onSubmit={enviar}>
        <h1>Encuesta</h1>
        <p className="subtitulo">Son 14 preguntas. Las de texto son opcionales.</p>
        <Opciones
          nombre="ayuda"
          pregunta="Durante la prueba, ¿alguien te ayudó o te dijo qué hacer?"
          opciones={[
            ['no', 'No'],
            ['una', 'Sí, una vez'],
            ['varias', 'Sí, varias veces'],
          ]}
        />
        <p className="instruccion-escala">Marca de 1 a 5: 1 = muy en desacuerdo, 5 = muy de acuerdo.</p>
        {LIKERT.map(({ id, texto, noAplica }) => (
          <fieldset key={id} className="pregunta escala">
            <legend>{texto}</legend>
            <div className="opciones-fila">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="opcion-radio">
                  <input type="radio" name={id} value={v} required />
                  <span>{v}</span>
                </label>
              ))}
              {noAplica && (
                <label className="opcion-radio">
                  <input type="radio" name={id} value="na" required />
                  <span>No me equivoqué</span>
                </label>
              )}
            </div>
          </fieldset>
        ))}
        {ABIERTAS.map(({ id, texto }) => (
          <label key={id} className="campo">
            <span>{texto}</span>
            <textarea name={id} rows={2} maxLength={1000} />
          </label>
        ))}
        {error && (
          <p className="error-form" role="alert">
            {error}
          </p>
        )}
        <button className="primario" type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Enviar respuestas'}
        </button>
      </form>
    </main>
  )
}
