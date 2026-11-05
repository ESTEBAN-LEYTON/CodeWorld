import { useEffect, useMemo, useRef, useState } from 'react'
import * as Blockly from 'blockly/core'
import { AYUDA_BLOQUES, programaAJson } from '../game/ayudaBloques'
import { BLOQUE_INICIO } from '../game/blocks'
import { ejecutar } from '../game/interpreter'
import { MazeView } from './MazeView'

// Muestra un bloque armado en un ejemplo y al robot ejecutándolo en un mini laberinto, en bucle.

const MS_POR_PASO = 550
const PAUSA_FINAL = 3

export function BloqueDemo({ tipo }: { tipo: string }) {
  const ayuda = AYUDA_BLOQUES[tipo]
  const contenedor = useRef<HTMLDivElement>(null)
  const traza = useMemo(() => ejecutar(ayuda.ejemplo, ayuda.laberinto).traza, [ayuda])
  const [paso, setPaso] = useState(0)

  useEffect(() => {
    if (!contenedor.current) return
    const ws = Blockly.inject(contenedor.current, {
      media: '/blockly-media/',
      readOnly: true,
      renderer: 'zelos',
      zoom: { startScale: 0.65 },
      move: { scrollbars: false, drag: false, wheel: false },
    })
    Blockly.serialization.blocks.append(programaAJson(ayuda.ejemplo, BLOQUE_INICIO), ws)
    ws.getTopBlocks(false)[0]?.moveBy(12, 12)
    return () => ws.dispose()
  }, [ayuda])

  useEffect(() => {
    const id = window.setInterval(() => setPaso((p) => (p + 1) % (traza.length + PAUSA_FINAL)), MS_POR_PASO)
    return () => window.clearInterval(id)
  }, [traza])

  return (
    <div className="bloque-demo">
      <div className="demo-texto">
        <h3>
          Bloque <span className="nombre-bloque">{ayuda.nombre}</span>
        </h3>
        <p>{ayuda.descripcion}</p>
        <p className="consejo">💡 {ayuda.consejo}</p>
      </div>
      <div className="demo-visual">
        <div ref={contenedor} className="demo-bloques" aria-label={`Ejemplo con el bloque ${ayuda.nombre}`} />
        <MazeView laberinto={ayuda.laberinto} robot={traza[Math.min(paso, traza.length - 1)]} chocado={false} mini />
      </div>
    </div>
  )
}
