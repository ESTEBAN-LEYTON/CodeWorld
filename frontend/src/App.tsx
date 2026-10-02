import { useEffect, useRef, useState } from 'react'
import type * as Blockly from 'blockly/core'
import { BlocklyEditor } from './components/BlocklyEditor'
import { MazeView } from './components/MazeView'
import { compilarWorkspace } from './game/blocks'
import { buscar, ejecutar } from './game/interpreter'
import { DESAFIOS } from './game/levels'
import type { Desafio, Posicion, ResultadoEjecucion } from './game/types'

const MS_POR_PASO = 350
const CLAVE_PROGRESO = 'codeworld.completados'

function posicionInicial(d: Desafio): Posicion {
  return { ...buscar(d.laberinto, 'I'), dir: d.laberinto.dirInicial }
}

// Progreso local (R2: offline-first). Se sincronizará con ProgressService más adelante.
function leerCompletados(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PROGRESO) ?? '[]')
  } catch {
    return []
  }
}

export default function App() {
  const [indice, setIndice] = useState(0)
  const desafio = DESAFIOS[indice]
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [robot, setRobot] = useState<Posicion>(() => posicionInicial(desafio))
  const [resultado, setResultado] = useState<(ResultadoEjecucion & { bloquesUsados: number }) | null>(null)
  const [ejecutando, setEjecutando] = useState(false)
  const [completados, setCompletados] = useState<string[]>(leerCompletados)

  const xp = DESAFIOS.filter((d) => completados.includes(d.id)).reduce((s, d) => s + d.xpRecompensa, 0)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(completados))
    } catch {
      // Sin almacenamiento disponible: el progreso vive solo en esta sesión.
    }
  }, [completados])

  const reiniciar = (d: Desafio = desafio) => {
    window.clearInterval(timer.current)
    setEjecutando(false)
    setResultado(null)
    setRobot(posicionInicial(d))
  }

  const irADesafio = (i: number) => {
    reiniciar(DESAFIOS[i])
    setIndice(i)
  }

  const ejecutarPrograma = () => {
    if (!ws.current) return
    reiniciar()
    // Se descuenta el bloque "Al ejecutar".
    const bloquesUsados = ws.current.getAllBlocks(false).length - 1
    const res = { ...ejecutar(compilarWorkspace(ws.current), desafio.laberinto), bloquesUsados }
    setEjecutando(true)
    let paso = 0
    timer.current = window.setInterval(() => {
      paso++
      if (paso < res.trace.length) {
        setRobot(res.trace[paso])
        return
      }
      window.clearInterval(timer.current)
      setEjecutando(false)
      setResultado(res)
      if (res.estado === 'exito') setCompletados((c) => (c.includes(desafio.id) ? c : [...c, desafio.id]))
    }, MS_POR_PASO)
  }

  return (
    <div className="app">
      <header className="barra">
        <h1>CodeWorld</h1>
        <nav className="niveles" aria-label="Desafíos">
          {DESAFIOS.map((d, i) => (
            <button
              key={d.id}
              className={`nivel ${i === indice ? 'activo' : ''} ${completados.includes(d.id) ? 'hecho' : ''}`}
              onClick={() => irADesafio(i)}
              title={d.titulo}
            >
              {i + 1}
            </button>
          ))}
        </nav>
        <span className="xp">⭐ {xp} XP</span>
      </header>

      <main className="contenido">
        <section className="panel-juego">
          <h2>{desafio.titulo}</h2>
          <p className="enunciado">{desafio.enunciado}</p>
          <MazeView laberinto={desafio.laberinto} robot={robot} chocado={resultado?.estado === 'choque'} />
          <div className="acciones">
            <button className="primario" onClick={ejecutarPrograma} disabled={ejecutando}>
              ▶ Ejecutar
            </button>
            <button onClick={() => reiniciar()}>↺ Reiniciar</button>
          </div>
          {resultado && (
            <div className={`feedback ${resultado.estado === 'exito' ? 'ok' : 'error'}`} role="status">
              <p>{resultado.mensaje}</p>
              {resultado.estado === 'exito' && (
                <>
                  <p>+{desafio.xpRecompensa} XP</p>
                  {desafio.bloquesOptimos && resultado.bloquesUsados > desafio.bloquesOptimos && (
                    <p className="pista">
                      Reto extra: se puede resolver con {desafio.bloquesOptimos} bloques. ¿Lo intentas?
                    </p>
                  )}
                  {indice < DESAFIOS.length - 1 && (
                    <button className="primario" onClick={() => irADesafio(indice + 1)}>
                      Siguiente desafío →
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className="panel-editor">
          <BlocklyEditor bloquesPermitidos={desafio.bloquesPermitidos} workspaceRef={ws} />
        </section>
      </main>
    </div>
  )
}
