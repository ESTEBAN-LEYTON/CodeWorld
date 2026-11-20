import { useState, type CSSProperties, type ReactNode } from 'react'
import { Robot } from './Robot'
import type { Direccion, Laberinto, Posicion } from '../game/types'

const ROTACION: Record<Direccion, number> = { N: -90, E: 0, S: 90, O: 180 }

interface Props {
  laberinto: Laberinto
  robot: Posicion
  chocado: boolean
  /** El robot llegó a la meta: la estrella se recoge con un destello. */
  exito?: boolean
  /** Celdas por las que ya pasó el robot en esta ejecución. */
  rastro?: Posicion[]
  /** Versión pequeña para las explicaciones de bloques. */
  mini?: boolean
  /** Efectos que se dibujan sobre el tablero (p. ej. el confeti al resolver). */
  children?: ReactNode
}

interface Pose {
  robot: Posicion
  /** Ángulo acumulado: así el robot gira siempre por el lado corto (nunca da 270° para girar 90°). */
  angulo: number
  /** Cambio de más de una celda (reinicio o vuelta del bucle): se coloca sin deslizarse a través de los muros. */
  salto: boolean
}

function siguientePose(previa: Pose, robot: Posicion): Pose {
  const distancia = Math.abs(robot.fila - previa.robot.fila) + Math.abs(robot.col - previa.robot.col)
  const salto = distancia > 1
  if (salto) return { robot, angulo: ROTACION[robot.dir], salto }
  const delta = ((((ROTACION[robot.dir] - previa.angulo) % 360) + 540) % 360) - 180
  return { robot, angulo: previa.angulo + delta, salto }
}

export function MazeView({ laberinto, robot, chocado, exito = false, rastro = [], mini = false, children }: Props) {
  const columnas = laberinto.celdas[0].length
  // Patrón de React para derivar estado del render anterior (no se usan refs: StrictMode renderiza dos veces).
  const [pose, setPose] = useState<Pose>(() => ({ robot, angulo: ROTACION[robot.dir], salto: true }))
  const previa = pose.robot
  if (previa.fila !== robot.fila || previa.col !== robot.col || previa.dir !== robot.dir) setPose(siguientePose(pose, robot))

  const pisadas = new Set(rastro.map((p) => `${p.fila}-${p.col}`))
  const ficha = { '--fila': pose.robot.fila, '--col': pose.robot.col } as CSSProperties

  return (
    <div
      className={`laberinto ${mini ? 'mini' : ''} ${exito ? 'exito' : ''}`}
      data-recorrido={mini ? undefined : 'laberinto'}
      style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)`, '--columnas': columnas } as CSSProperties}
      role="img"
      aria-label="Laberinto del desafío"
    >
      {laberinto.celdas.flatMap((fila, f) =>
        [...fila].map((c, col) => (
          <div key={`${f}-${col}`} className={`celda ${c === '#' ? 'pared' : 'camino'} ${pisadas.has(`${f}-${col}`) ? 'pisada' : ''}`}>
            {c === 'M' && <span className="meta" aria-hidden>★</span>}
          </div>
        )),
      )}
      <div className="capa-robot" aria-hidden>
        <span className={`ficha-robot ${pose.salto ? 'sin-transicion' : ''}`} style={ficha}>
          <span className={`robot ${chocado ? 'chocado' : ''}`} style={{ rotate: `${pose.angulo}deg` }}>
            <Robot />
          </span>
        </span>
      </div>
      {children}
    </div>
  )
}
