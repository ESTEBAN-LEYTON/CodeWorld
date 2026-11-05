import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as Blockly from 'blockly/core'
import { ErrorApi, llamar, mensajeDeError } from '../api'
import { useAyudaVista } from '../ayudaVista'
import { BloqueDemo } from '../components/BloqueDemo'
import { BlocklyEditor } from '../components/BlocklyEditor'
import { MazeView } from '../components/MazeView'
import { Modal } from '../components/Modal'
import { Recorrido, type PasoRecorrido } from '../components/Recorrido'
import { bloquesNuevos } from '../game/ayudaBloques'
import { compilarWorkspace } from '../game/blocks'
import { cargarNiveles } from '../game/contenido'
import { GestorProgreso, type RespuestaSync } from '../game/gestorProgreso'
import { ejecutar, posicionInicial } from '../game/interpreter'
import { seleccionar } from '../game/motorGuias'
import type { Desafio, GuiaCorrectiva, Nivel, Posicion, Progreso, ResultadoEjecucion } from '../game/types'
import { MenuAlumno } from './MenuAlumno'

// Caso de uso central «Resolver desafío con bloques» (Figuras 4 y 5 del informe):
// menú de niveles, desafío, tutoriales guiados y explicación de los bloques nuevos.

const MS_POR_PASO = 350

// Onboarding guiado de 3 pasos (Tabla 1 y riesgo R5 del informe), en el menú y en el primer desafío.
const RECORRIDO_MENU: PasoRecorrido[] = [
  { selector: '.tarjeta-nivel', titulo: 'Elige un nivel', texto: 'Cada nivel enseña una idea nueva de programación. Toca un desafío para jugarlo.' },
  { selector: '[data-recorrido="continuar"]', titulo: 'Sigue donde quedaste', texto: 'Este botón te lleva directo a tu próximo desafío pendiente.' },
  {
    selector: '[data-recorrido="estado"]',
    titulo: 'Gana experiencia',
    texto: 'Cada desafío resuelto te da puntos de experiencia (XP). Tu progreso se guarda solo, incluso si se corta internet.',
  },
]

const RECORRIDO_JUEGO: PasoRecorrido[] = [
  { selector: '[data-recorrido="laberinto"]', titulo: 'Tu misión', texto: 'Lleva al robot ➤ hasta la estrella ★. La flecha muestra hacia dónde mira.' },
  {
    selector: '.panel-editor',
    titulo: 'Arma tu programa',
    texto: 'Arrastra los bloques de la columna gris y encájalos debajo de «▶ Al ejecutar», como piezas de un puzle. El robot los sigue de arriba hacia abajo.',
  },
  {
    selector: '[data-recorrido="ejecutar"]',
    titulo: 'Pruébalo',
    texto: 'Presiona Ejecutar para ver a tu robot. Si se equivoca, te daremos una pista. Y si olvidas qué hace un bloque, usa «¿Cómo funcionan los bloques?».',
  },
]

type Conexion = 'sincronizado' | 'pendiente' | 'sin-conexion' | 'sincronizando'

interface Props {
  token: string
  alumnoId: string
  username: string
  onSalir: () => void
}

interface Retro {
  resultado: ResultadoEjecucion
  guia: GuiaCorrectiva | null
  bloquesUsados: number
  /** Tiempo de Interpretador + MotorGuias en el navegador (RNF01: ≤ 300 ms). */
  ms: number
}

export function Juego({ token, alumnoId, username, onSalir }: Props) {
  const gestor = useMemo(() => new GestorProgreso(alumnoId), [alumnoId])
  const [niveles, setNiveles] = useState<Nivel[] | null>(null)
  const [errorCarga, setErrorCarga] = useState('')
  const [origen, setOrigen] = useState<'servidor' | 'cache'>('servidor')
  const [actualId, setActualId] = useState<string | null>(null)
  const [ayuda, marcarAyuda] = useAyudaVista(`alumno.${username}`)
  const [recorrido, setRecorrido] = useState<'menu' | null>(null)
  const [completados, setCompletados] = useState<string[]>(gestor.completados)
  const [conexion, setConexion] = useState<Conexion>(gestor.pendientes ? 'pendiente' : 'sincronizado')

  const desafios = useMemo(() => niveles?.flatMap((n) => n.desafios) ?? [], [niveles])
  const desafio = desafios.find((d) => d.id === actualId) ?? null
  const nuevos = useMemo(() => bloquesNuevos(niveles ?? []), [niveles])
  const nivelDe = (d: Desafio) => niveles?.find((n) => n.desafios.includes(d))
  const xp = desafios.filter((d) => completados.includes(d.id)).reduce((s, d) => s + d.xpRecompensa, 0)

  // GestorProgreso.sincronizar(): envía el lote pendiente a ServicioProgreso.
  const sincronizar = useCallback(async () => {
    setConexion('sincronizando')
    try {
      await gestor.sincronizar((registros: Progreso[]) =>
        llamar<RespuestaSync>('/progreso/sincronizar', { metodo: 'POST', token, cuerpo: { registros } }),
      )
      setCompletados(gestor.completados)
      setConexion('sincronizado')
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 401) return onSalir()
      setConexion(e instanceof ErrorApi && e.sinConexion ? 'sin-conexion' : 'pendiente')
    }
  }, [gestor, token, onSalir])

  useEffect(() => {
    let vigente = true
    const iniciar = async () => {
      let contenido
      try {
        contenido = await cargarNiveles()
      } catch (e) {
        if (vigente) setErrorCarga(mensajeDeError(e))
        return
      }
      if (!vigente) return
      setNiveles(contenido.niveles)
      setOrigen(contenido.origen)
      await sincronizar()
    }
    void iniciar()
    // Al recuperar la conexión se envía lo que quedó pendiente en localStorage.
    window.addEventListener('online', sincronizar)
    return () => {
      vigente = false
      window.removeEventListener('online', sincronizar)
    }
  }, [gestor, sincronizar])

  if (errorCarga) {
    return (
      <main className="centrado">
        <div className="tarjeta">
          <h2>No pudimos cargar los desafíos</h2>
          <p>{errorCarga} Revisa tu conexión e intenta de nuevo.</p>
          <button className="primario" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="app">
      <header className="barra">
        <h1 className="logo-barra">CodeWorld</h1>
        {desafio && (
          <button onClick={() => setActualId(null)} className="volver-menu">
            ← Menú
          </button>
        )}
        <span className="espacio" />
        <span className="estado-alumno" data-recorrido="estado">
          <span className="xp">⭐ {xp} XP</span>
          <EstadoConexion conexion={conexion} pendientes={gestor.pendientes} onReintentar={sincronizar} />
        </span>
        <span className="usuario">🧩 {username}</span>
        {!desafio && (
          <button onClick={() => setRecorrido('menu')} title="Ver de nuevo el tutorial">
            ¿Cómo se juega?
          </button>
        )}
        <button onClick={onSalir}>Salir</button>
      </header>
      {origen === 'cache' && <p className="aviso">Sin conexión: estás jugando con los desafíos guardados en este dispositivo.</p>}
      {!niveles ? (
        <p className="centrado">Cargando desafíos…</p>
      ) : desafio ? (
        <PantallaDesafio
          key={desafio.id}
          desafio={desafio}
          nivel={nivelDe(desafio)!}
          siguiente={desafios[desafios.indexOf(desafio) + 1] ?? null}
          nuevos={(nuevos.get(desafio.id) ?? []).filter((b) => !ayuda.bloques.includes(b))}
          mostrarRecorrido={!ayuda.juego}
          onRecorridoVisto={() => marcarAyuda({ juego: true })}
          onBloquesVistos={(b) => marcarAyuda({ bloques: [...new Set([...ayuda.bloques, ...b])] })}
          onIr={setActualId}
          onMenu={() => setActualId(null)}
          onResultado={(r) => {
            if (gestor.registrarResultado(desafio.id, r)) {
              setCompletados(gestor.completados)
              setConexion('pendiente')
              void sincronizar()
            }
          }}
        />
      ) : (
        <>
          <MenuAlumno username={username} niveles={niveles} completados={completados} nuevos={nuevos} onJugar={setActualId} />
          {(recorrido === 'menu' || !ayuda.menu) && (
            <Recorrido
              pasos={RECORRIDO_MENU}
              onTerminar={() => {
                setRecorrido(null)
                marcarAyuda({ menu: true })
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

function EstadoConexion({ conexion, pendientes, onReintentar }: { conexion: Conexion; pendientes: number; onReintentar: () => void }) {
  const textos: Record<Conexion, string> = {
    sincronizado: '☁️ Progreso guardado',
    sincronizando: '🔄 Guardando…',
    pendiente: `⏳ ${pendientes} por guardar`,
    'sin-conexion': `📴 Sin conexión · ${pendientes} por guardar`,
  }
  return (
    <button className={`estado-sync ${conexion}`} onClick={onReintentar} title="Sincronizar ahora" disabled={conexion === 'sincronizando'}>
      {textos[conexion]}
    </button>
  )
}

interface PropsDesafio {
  desafio: Desafio
  nivel: Nivel
  siguiente: Desafio | null
  /** Bloques que el alumno ve por primera vez en este desafío. */
  nuevos: string[]
  mostrarRecorrido: boolean
  onRecorridoVisto: () => void
  onBloquesVistos: (bloques: string[]) => void
  onIr: (id: string) => void
  onMenu: () => void
  onResultado: (r: ResultadoEjecucion) => void
}

function PantallaDesafio(props: PropsDesafio) {
  const { desafio, nivel, siguiente, nuevos, onIr, onMenu, onResultado } = props
  // Primero el recorrido guiado (solo la primera vez) y luego la explicación de los bloques nuevos.
  const [recorrido, setRecorrido] = useState(props.mostrarRecorrido)
  const [ayudaBloques, setAyudaBloques] = useState<{ bloques: string[]; nuevos: boolean } | null>(
    nuevos.length ? { bloques: nuevos, nuevos: true } : null,
  )
  const cerrarAyuda = () => {
    if (ayudaBloques?.nuevos) props.onBloquesVistos(ayudaBloques.bloques)
    setAyudaBloques(null)
  }
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [robot, setRobot] = useState<Posicion>(() => posicionInicial(desafio.laberinto))
  const [retro, setRetro] = useState<Retro | null>(null)
  const [animando, setAnimando] = useState(false)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const reiniciar = () => {
    window.clearInterval(timer.current)
    setAnimando(false)
    setRetro(null)
    setRobot(posicionInicial(desafio.laberinto))
  }

  // EditorBloques.ejecutar(): obtenerPrograma() -> Interpretador.ejecutar() -> [EXITO] progreso / [else] MotorGuias.
  const ejecutarPrograma = () => {
    if (!ws.current) return
    reiniciar()
    const t0 = performance.now()
    const programa = compilarWorkspace(ws.current)
    const resultado = ejecutar(programa, desafio.laberinto)
    const guia = resultado.patronError ? seleccionar(resultado.patronError, desafio.guias) : null
    const ms = performance.now() - t0
    // Se descuenta el bloque «Al ejecutar».
    const bloquesUsados = ws.current.getAllBlocks(false).length - 1

    setAnimando(true)
    let paso = 0
    timer.current = window.setInterval(() => {
      paso++
      if (paso < resultado.traza.length) {
        setRobot(resultado.traza[paso])
        return
      }
      window.clearInterval(timer.current)
      setAnimando(false)
      setRetro({ resultado, guia, bloquesUsados, ms })
      onResultado(resultado)
    }, MS_POR_PASO)
  }

  const exito = retro?.resultado.estado === 'EXITO'

  return (
    <main className="contenido">
      <section className="panel-juego">
        <p className="miga">
          Nivel {nivel.orden} · {nivel.titulo} · Desafío {desafio.orden} de {nivel.desafios.length}
        </p>
        <h2>{desafio.titulo}</h2>
        <p className="enunciado">{desafio.enunciado}</p>
        <MazeView laberinto={desafio.laberinto} robot={robot} chocado={retro?.resultado.patronError === 'choque'} />
        <div className="acciones">
          <button className="primario" data-recorrido="ejecutar" onClick={ejecutarPrograma} disabled={animando}>
            ▶ Ejecutar
          </button>
          <button onClick={reiniciar}>↺ Reiniciar</button>
        </div>
        <button className="enlace ayuda-bloques" data-recorrido="ayuda-bloques" onClick={() => setAyudaBloques({ bloques: desafio.bloquesPermitidos, nuevos: false })}>
          ❓ ¿Cómo funcionan los bloques?
        </button>
        {retro && (
          <div className={`feedback ${exito ? 'ok' : retro.resultado.estado === 'REINTENTO' ? 'reintento' : 'error'}`} role="status">
            {exito ? (
              <>
                <p>
                  <strong>¡Lo lograste!</strong> Tu robot llegó a la meta.
                </p>
                <p>+{desafio.xpRecompensa} XP</p>
                {desafio.bloquesOptimos && retro.bloquesUsados > desafio.bloquesOptimos && (
                  <p className="pista">Reto extra: se puede resolver con {desafio.bloquesOptimos} bloques. ¿Lo intentas?</p>
                )}
                <div className="acciones">
                  {siguiente && (
                    <button className="primario" onClick={() => onIr(siguiente.id)}>
                      Siguiente desafío →
                    </button>
                  )}
                  <button onClick={onMenu}>Volver al menú</button>
                </div>
              </>
            ) : (
              <p>{retro.guia?.mensaje}</p>
            )}
            <p className="medicion">
              ⚡ Evaluado en tu navegador en {retro.ms < 1 ? '<1' : Math.round(retro.ms)} ms · {retro.resultado.pasos} pasos
            </p>
          </div>
        )}
      </section>
      <section className="panel-editor">
        <BlocklyEditor bloquesPermitidos={desafio.bloquesPermitidos} workspaceRef={ws} />
      </section>
      {recorrido ? (
        <Recorrido
          pasos={RECORRIDO_JUEGO}
          onTerminar={() => {
            setRecorrido(false)
            props.onRecorridoVisto()
          }}
        />
      ) : (
        ayudaBloques && (
          <Modal
            titulo={ayudaBloques.nuevos ? (ayudaBloques.bloques.length > 1 ? '¡Bloques nuevos!' : '¡Bloque nuevo!') : 'Bloques de este desafío'}
            onCerrar={cerrarAyuda}
            pie={
              <button className="primario" onClick={cerrarAyuda}>
                {ayudaBloques.nuevos ? '¡A probarlo!' : 'Cerrar'}
              </button>
            }
          >
            {ayudaBloques.bloques.map((b) => (
              <BloqueDemo key={b} tipo={b} />
            ))}
          </Modal>
        )
      )}
    </main>
  )
}
